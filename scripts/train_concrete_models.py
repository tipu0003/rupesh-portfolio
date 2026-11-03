"""Reproduce the portfolio's public UCI concrete demonstrators (optional offline training).

Run from any directory with Python 3.12 and the versions listed in ml/MODELS.md.
The two optional source ZIP paths allow reproduction without network access.
"""
import argparse
import hashlib
from io import BytesIO
import json
from pathlib import Path
from tempfile import NamedTemporaryFile
from urllib.request import urlopen
from zipfile import ZipFile

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupKFold, GroupShuffleSplit
from sklearn.preprocessing import StandardScaler
from threadpoolctl import threadpool_limits


ROOT = Path(__file__).resolve().parents[1]
MATERIALS = ["cement", "slag", "flyAsh", "water", "superplasticizer", "coarseAggregate", "fineAggregate"]
LABELS = ["Cement", "Blast-furnace slag", "Fly ash", "Water", "Superplasticizer",
          "Coarse aggregate", "Fine aggregate"]
SOURCES = {
    "strength": {
        "name": "Concrete Compressive Strength", "url": "https://archive.ics.uci.edu/dataset/165/concrete+compressive+strength",
        "doi": "10.24432/C5PK67", "creator": "I-Cheng Yeh", "year": 1998, "rows": 1030,
        "archive": "https://archive.ics.uci.edu/static/public/165/concrete+compressive+strength.zip",
        "member": "Concrete_Data.xls", "sha256": "710076c66b9ca3f8050e7942f3dcbdbe04013534daeb0077ffd3079a52d8e0c4"
    },
    "slump": {
        "name": "Concrete Slump Test", "url": "https://archive.ics.uci.edu/dataset/182/concrete+slump+test",
        "doi": "10.24432/C5FG7D", "creator": "I-Cheng Yeh", "year": 2007, "rows": 103,
        "archive": "https://archive.ics.uci.edu/static/public/182/concrete+slump+test.zip",
        "member": "slump_test.data", "sha256": "78cea9fbb28ad8fc17f389e216e724dc04642c6c363143e67f6bcb97e74525ee"
    },
}
LICENSE_URL = "https://creativecommons.org/licenses/by/4.0/"
SEED = 42


def read_dataset(source, override):
    if override:
        archive = Path(override).read_bytes()
    else:
        with urlopen(source["archive"], timeout=40) as response:
            archive = response.read()
    with ZipFile(BytesIO(archive)) as bundle:
        raw = bundle.read(source["member"])
    if hashlib.sha256(raw).hexdigest() != source["sha256"]:
        raise ValueError(f"Unexpected contents of {source['member']}. Check the UCI source before retraining.")
    if source["member"].endswith(".xls"):
        frame = pd.read_excel(BytesIO(raw), engine="xlrd")
        frame.columns = MATERIALS + ["age", "strength"]
    else:
        frame = pd.read_csv(BytesIO(raw)).iloc[:, 1:]  # Drop the specimen identifier.
        frame.columns = MATERIALS + ["slump", "flow", "strength28"]
    if len(frame) != source["rows"] or not np.isfinite(frame.to_numpy()).all():
        raise ValueError("Unexpected dataset size or missing measurements.")
    return frame


def fit_model(x, y, candidate, monotonic_age):
    """Optional standardized ridge baseline; the tree ensemble fits its residuals."""
    use_linear, leaves, iterations, min_leaf = candidate
    slopes = np.zeros(x.shape[1])
    base = 0.0
    if use_linear:
        scaler = StandardScaler().fit(x)
        linear = Ridge(alpha=1.0).fit(scaler.transform(x), y)
        slopes = linear.coef_ / scaler.scale_
        if monotonic_age:
            slopes[-1] = max(0.0, slopes[-1])
        base = float(linear.intercept_ - slopes @ scaler.mean_)
    ensemble = None
    if leaves:
        constraints = np.zeros(x.shape[1], dtype=int)
        if monotonic_age:
            constraints[-1] = 1
        ensemble = HistGradientBoostingRegressor(max_iter=iterations, learning_rate=0.085,
            max_leaf_nodes=leaves, min_samples_leaf=min_leaf, l2_regularization=0.6,
            early_stopping=False, monotonic_cst=constraints, random_state=SEED)
        ensemble.fit(x, y - (base + x @ slopes))
    return base, slopes, ensemble


def predict(fitted, x):
    base, slopes, ensemble = fitted
    return base + x @ slopes + (ensemble.predict(x) if ensemble else 0.0)


def export_trees(ensemble):
    if ensemble is None:
        return 0.0, []
    trees = []
    for (predictor,) in ensemble._predictors:
        nodes = []
        for node in predictor.nodes:
            if node["is_leaf"]:
                nodes.append([round(float(node["value"]), 9)])
            else:
                # Retain sklearn's full threshold: rounding it may flip an exact input.
                nodes.append([int(node["feature_idx"]), float(node["num_threshold"]),
                              int(node["left"]), int(node["right"])])
        trees.append(nodes)
    return float(ensemble._baseline_prediction.item()), trees


def portable_predict(record, x):
    result = record["base"] + float(np.dot(record["linearWeights"], x))
    for tree in record["trees"]:
        node = tree[0]
        while len(node) == 4:
            feature, threshold, left, right = node
            node = tree[left if x[feature] <= threshold else right]
        result += node[0]
    return result


def representative_rows(x, age_index=None):
    """Distinct observed training recipes chosen by farthest-first coverage, not predicted score."""
    unique = np.unique(x, axis=0)
    norm = (unique - unique.min(axis=0)) / np.maximum(np.ptp(unique, axis=0), 1e-12)
    center = np.median(norm, axis=0)
    distance = np.linalg.norm(norm - center, axis=1)
    if age_index is not None:
        distance[unique[:, age_index] != 28] = np.inf
    first = int(np.argmin(distance))
    chosen = [first]
    nearest = np.sum(np.square(norm - norm[first]), axis=1)
    for _ in range(1, min(200, len(unique))):
        index = int(np.argmax(nearest))
        chosen.append(index)
        nearest = np.minimum(nearest, np.sum(np.square(norm - norm[index]), axis=1))
    return unique[chosen], unique[first]


def rounded_rows(a):
    return np.round(a.astype(float), 6).tolist()


def train(name, frame, target, extra, unit, source):
    columns = MATERIALS + ([extra] if extra else [])
    x = frame[columns].to_numpy(dtype=float)
    y = frame[target].to_numpy(dtype=float)
    # Nearby versions of the same recipe (reported to different decimal precision) often recur.
    # Round masses to 1 kg/m³ for grouping and ignore age/strength when splitting.
    groups = np.unique(np.rint(x[:, :7]), axis=0, return_inverse=True)[1]
    train_idx, test_idx = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED).split(x, y, groups))
    assert not set(groups[train_idx]) & set(groups[test_idx])
    group_train = groups[train_idx]
    big = len(x) > 500
    min_leaf = 12 if big else 5
    candidates = [(True, 0, 0, 0), (False, 7, 100, min_leaf), (True, 7, 100, min_leaf),
                  (False, 15 if big else 5, 160, min_leaf), (True, 15 if big else 5, 160, min_leaf)]
    cv_splits = list(GroupKFold(n_splits=4).split(x[train_idx], groups=group_train))
    scores = []
    for candidate in candidates:
        cv_pred = np.empty(len(train_idx))
        for fit, val in cv_splits:
            model = fit_model(x[train_idx[fit]], y[train_idx[fit]], candidate, extra == "age")
            cv_pred[val] = predict(model, x[train_idx[val]])
        scores.append(float(np.sqrt(mean_squared_error(y[train_idx], cv_pred))))
    selected = int(np.argmin(scores))
    config = candidates[selected]
    fitted = fit_model(x[train_idx], y[train_idx], config, extra == "age")
    eval_pred = predict(fitted, x[test_idx])
    ref_rows, default = representative_rows(x[train_idx], 7 if extra == "age" else None)
    names = LABELS + (["Curing age"] if extra == "age" else ["Measured 7-day strength"] if extra else [])
    units = ["kg/m³"] * 7 + (["days"] if extra == "age" else ["MPa"] if extra else [])
    lo, hi = np.min(x[train_idx], axis=0), np.max(x[train_idx], axis=0)
    features = [
        {"key": key, "label": label, "unit": f_unit, "min": float(round(a, 6)),
         "max": float(round(b, 6)), "default": float(round(c, 6))}
        for key, label, f_unit, a, b, c in zip(columns, names, units, lo, hi, default)
    ]
    age_baseline, trees = export_trees(fitted[2])
    ratio = x[train_idx, 3] / np.sum(x[train_idx, :3], axis=1)
    total = x[train_idx, :7].sum(axis=1)
    quick = lambda v: round(float(v), 4)
    public_source = {k: source[k] for k in ("name", "url", "doi", "creator", "year", "rows")}
    public_source.update({"license": "CC BY 4.0", "licenseUrl": LICENSE_URL})
    record = {
        "name": name, "unit": unit, "features": features, "dataset": public_source,
        "algorithm": ("Ridge regression" if not trees else
                      "Ridge regression with boosted residual trees" if config[0] else "Gradient-boosted trees"),
        "base": fitted[0] + age_baseline, "linearWeights": fitted[1].tolist(), "trees": trees,
        "referenceMixes": rounded_rows(ref_rows),
        "domain": {"waterBinder": [float(ratio.min()), float(ratio.max())],
                   "totalMass": [float(total.min()), float(total.max())]},
        "metrics": {
            "nTrain": len(train_idx), "nTest": len(test_idx),
            "nTrainGroups": len(set(group_train)), "nTestGroups": len(set(groups[test_idx])),
            "r2": quick(r2_score(y[test_idx], eval_pred)),
            "rmse": quick(np.sqrt(mean_squared_error(y[test_idx], eval_pred))),
            "mae": quick(mean_absolute_error(y[test_idx], eval_pred)),
            "p90AbsError": quick(np.quantile(np.abs(y[test_idx] - eval_pred), .90)),
            "trainingCvRmse": quick(scores[selected]),
            "holdout": rounded_rows(np.column_stack([y[test_idx], eval_pred])),
        },
    }
    # Validate the exact portable tree representation on every original observation.
    predicted = np.asarray([portable_predict(record, row) for row in x])
    np.testing.assert_allclose(predicted, predict(fitted, x), atol=2.e-6, rtol=1.e-7)
    print(f"{name}: {record['algorithm']} | train={len(train_idx)}, test={len(test_idx)}; "
          f"R²={record['metrics']['r2']}, MAE={record['metrics']['mae']} {unit}")
    return record


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--strength-zip", help="Optional local archive downloaded from UCI.")
    parser.add_argument("--slump-zip", help="Optional local archive downloaded from UCI.")
    parser.add_argument("--output", type=Path, default=ROOT / "ml/data/models.json")
    args = parser.parse_args()
    strength = read_dataset(SOURCES["strength"], args.strength_zip)
    slump = read_dataset(SOURCES["slump"], args.slump_zip)
    # Pair only actual test results from the identical seven mass values. Average same-age repeats.
    paired = strength.pivot_table(index=MATERIALS, columns="age", values="strength", aggfunc="mean")
    paired = paired.loc[:, [7, 28]].dropna().rename(columns={7: "earlyStrength", 28: "strength28"}).reset_index()
    tasks = [
        ("strength", "Compressive strength by age", strength, "strength", "age", "MPa", SOURCES["strength"]),
        ("slump", "Concrete slump", slump, "slump", None, "cm", SOURCES["slump"]),
        ("flow", "Concrete slump flow", slump, "flow", None, "cm", SOURCES["slump"]),
        ("strength28", "28-day strength of slump-test mixes", slump, "strength28", None, "MPa", SOURCES["slump"]),
        ("early28", "28-day strength from a 7-day test", paired, "strength28", "earlyStrength", "MPa", SOURCES["strength"]),
    ]
    with threadpool_limits(limits=1):
        models = {key: train(*task) for key, *task in tasks}
    bundle = {"version": 1, "models": models}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile(mode="w", encoding="utf-8", dir=args.output.parent, delete=False) as f:
        json.dump(bundle, f, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
        f.write("\n")
        tmp = Path(f.name)
    tmp.chmod(0o644)
    tmp.replace(args.output)
    print(f"Saved {args.output} ({args.output.stat().st_size:,} bytes).")


if __name__ == "__main__":
    main()
