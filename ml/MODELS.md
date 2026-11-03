# Concrete models for the portfolio laboratory

These models were trained for this site on public laboratory measurements. They illustrate how to explore material proportions and model error. They are independent benchmark models. The site does not present them as implementations of a specific published paper by Dr. Tipu.

## Measurements and attribution

- I-Cheng Yeh (1998), [Concrete Compressive Strength](https://doi.org/10.24432/C5PK67), UCI Machine Learning Repository. The original table has 1,030 measurements, seven material masses in kg/m³, curing age in days and compressive strength in MPa.
- I-Cheng Yeh (2007), [Concrete Slump Test](https://doi.org/10.24432/C5FG7D), UCI Machine Learning Repository. There are 103 measured mixes with slump in cm, flow in cm and 28-day strength in MPa. The specimen number is excluded from the predictors.

Both sources carry [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). This adaptation fits predictive models, selects reference recipes from training measurements and exports held-out measured/predicted pairs. A reference recipe is an input used in a reported experiment. Its model estimate is a prediction, even when that recipe also has an observed response.

## Validation

| Task | Training rows | Test rows | Test MAE | Test RMSE | Test R² |
| --- | ---: | ---: | ---: | ---: | ---: |
| Strength at selected age | 845 | 185 | 4.28 MPa | 5.88 MPa | 0.842 |
| Slump | 82 | 21 | 5.85 cm | 8.46 cm | 0.202 |
| Slump flow | 82 | 21 | 10.41 cm | 14.30 cm | 0.214 |
| 28-day strength, slump-test dataset | 82 | 21 | 1.24 MPa | 1.99 MPa | 0.900 |
| 28-day strength from measured 7-day strength | 91 | 24 | 2.83 MPa | 3.74 MPa | 0.908 |

Every split groups specimens by the seven material masses rounded to the nearest kg/m³. All ages from the same group stay together. The 80/20 split applies to groups, so the fraction of *rows* in each set varies. The split seed is 42. Four-fold group cross-validation on the training groups selects among ridge regression, histogram gradient-boosted trees and a ridge baseline with boosted residual trees. Selection minimizes out-of-fold RMSE. The distributed models fit the training partition only. Validation results describe a single group-held-out split within each source. They do not establish transfer to other cement systems, test protocols or construction sites.

For early strength, the training procedure pairs 7-day and 28-day laboratory results only when the original seven masses match exactly. It averages repeated observations for an identical recipe at an identical age. This produces 115 paired recipes. Group separation prevents rounded variants from crossing partitions. For the age-dependent strength model, a monotonic constraint prevents a decrease in predicted strength as only age increases. Tree-based curves may contain flat segments.

The two fresh-concrete predictions have weak held-out fit and considerable error. They are exploratory demonstrations. Negative physical predictions are unsuitable for interpretation. The reported 90th percentile of absolute error summarizes this test sample. It is not a calibrated prediction interval, a strength grade or a guarantee. These models are not qualified for construction acceptance, specification or structural design.

## Data and inference

The browser loads a versioned static JSON package, without a prediction server, account or API key. Material bounds, water/binder ratio bounds, total mass bounds and reference recipes come from training data. A component within its own range may still form an unfamiliar combination with other inputs. The default for each tool is an actual training observation. The first reference row equals the default recipe. Reference selection uses farthest-first sampling after range normalization, up to 200 measured training inputs.

Each model stores a base, one coefficient for each raw input and an optional tree ensemble. A prediction begins with the base plus the dot product of those coefficients and the input. For each tree, a branch goes left when its selected input is less than or equal to the threshold, and right otherwise. Add the resulting leaf value. Evaluating the compact representation reproduces the fitted library predictions on every original observation within 0.000002 target units. The training script pins each input file's SHA-256 digest and checks finite measurements, dataset size, group separation and inference parity.

## Reproduce

The normal site build reads the committed model package. Training is optional and runs independently of daily publication updates. The training environment used Python 3.12, scikit-learn 1.8.0, pandas 2.2.3, NumPy 2.3.5 and xlrd. From the repository root:

```sh
python -m pip install scikit-learn==1.8.0 pandas==2.2.3 numpy==2.3.5 xlrd threadpoolctl
python scripts/train_concrete_models.py
```

The script downloads the original UCI archives. For offline reproduction, supply local copies using `--strength-zip` and `--slump-zip`. To regenerate a comparison file, set `--output` to a different path.
