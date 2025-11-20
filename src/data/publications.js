// src/data/publications.js
// Lightweight structured list of publications for the portfolio site.
// Keep fields concise so UI can render quickly. Add/adjust fields as needed.

/**
 * @typedef {Object} Publication
 * @property {string} title
 * @property {string[]} authors               // short names in order
 * @property {number} year
 * @property {string} venue                   // Source title (journal / conference / book)
 * @property {"Article"|"Conference paper"|"Book chapter"} type
 * @property {string=} volume
 * @property {string=} issue
 * @property {string=} articleNumber
 * @property {string=} pages                  // "start–end" or just start if single page or empty
 * @property {number=} citedBy
 * @property {string=} doi
 * @property {string=} url
 * @property {string=} eid                    // Scopus EID (if available)
 * @property {string=} publisher
 * @property {string=} issn
 * @property {string=} isbn
 */

const publications /** @type {Publication[]} */ = [
  {
    title:
      "Hybrid assessment of concrete with recycled aggregate using experiment and machine learning techniques for structural performance optimization",
    authors: ["Paruthi S.", "Tipu R.K.", "Nisar N.", "Nisar N.", "Waris M.", "Khan A.H."],
    year: 2025,
    venue: "Innovative Infrastructure Solutions",
    type: "Article",
    volume: "10",
    issue: "10",
    articleNumber: "479",
    citedBy: 0,
    doi: "10.1007/s41062-025-02290-6",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105016887867&doi=10.1007%2fs41062-025-02290-6&partnerID=40&md5=266497e3cfb012894d236b854929fdd8",
    eid: "2-s2.0-105016887867",
    issn: "23644176",
    publisher: "Springer Science and Business Media Deutschland GmbH"
  },
  {
    title:
      "A hybrid deep learning and evolutionary framework for energy-aware interior augmentation via photorealistic visual illusions",
    authors: ["Liu Y.", "Isleem H.F.", "Tipu R.K.", "El Hindi K."],
    year: 2025,
    venue: "Engineering Applications of Artificial Intelligence",
    type: "Article",
    volume: "162",
    articleNumber: "112743",
    citedBy: 0,
    doi: "10.1016/j.engappai.2025.112743",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105019314565&doi=10.1016%2fj.engappai.2025.112743&partnerID=40&md5=542b71a8791d56d50422a92de1496f7a",
    eid: "2-s2.0-105019314565",
    issn: "09521976",
    publisher: "Elsevier Ltd"
  },
  {
    title:
      "Weighted-ensemble machine learning for simultaneous non-destructive prediction of rebound number and ultrasonic pulse velocity in concrete",
    authors: ["Sharma N.", "Dewangan A.", "Singh N.", "Bhattacharya D.", "Paruthi S.", "Tipu R.K."],
    year: 2025,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "26",
    issue: "11",
    pages: "4775–4796",
    citedBy: 1,
    doi: "10.1007/s42107-025-01455-z",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105012244650&doi=10.1007%2fs42107-025-01455-z&partnerID=40&md5=25fe0f73d386f7a6c257b99021ee9e60",
    eid: "2-s2.0-105012244650",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Advancing Water Quality Management: An Integrated Approach Using Ensemble Machine Learning and Real-Time Interactive Visualization",
    authors: ["Pandya J.K.", "Khandelwal S.S.", "Tipu R.K.", "Pandya K.S."],
    year: 2025,
    venue: "IEEE Access",
    type: "Article",
    citedBy: 2,
    doi: "10.1109/ACCESS.2025.3573589",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105006924613&doi=10.1109%2fACCESS.2025.3573589&partnerID=40&md5=e448714c80767293d094d22e505f7ad0",
    eid: "2-s2.0-105006924613",
    issn: "21693536",
    publisher: "IEEE"
  },
  {
    title:
      "Physics-informed neural networks for predicting sediment transport in pressurized pipe flows",
    authors: ["Tipu R.K.", "Bhakhar R.", "Pandya K.S.", "Panchal V.R."],
    year: 2025,
    venue: "Environmental Earth Sciences",
    type: "Article",
    volume: "84",
    issue: "11",
    articleNumber: "292",
    citedBy: 0,
    doi: "10.1007/s12665-025-12295-0",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105005506211&doi=10.1007%2fs12665-025-12295-0&partnerID=40&md5=1dd3400ae76afe3538de00ac0e0969f8",
    eid: "2-s2.0-105005506211",
    issn: "18666280",
    publisher: "Springer"
  },
  {
    title:
      "Interpretable GA-PSO-optimised deep learning for multi-objective geopolymer concrete strength prediction",
    authors: ["Sharma N.", "Seema", "Paruthi S.", "Tipu R.K."],
    year: 2025,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "26",
    issue: "11",
    pages: "4679–4706",
    citedBy: 0,
    doi: "10.1007/s42107-025-01450-4",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105011341541&doi=10.1007%2fs42107-025-01450-4&partnerID=40&md5=8b23c5aa53f48bc133c540374912aab5",
    eid: "2-s2.0-105011341541",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Deep Learning and Optimization Techniques for Sentiment-Driven Stock Market Prediction Using Transformer Models",
    authors: ["Batra V.", "Suman", "Tipu R.K."],
    year: 2025,
    venue:
      "2025 2nd International Conference on Multidisciplinary Research and Innovations in Engineering (MRIE)",
    type: "Conference paper",
    pages: "433–438",
    doi: "10.1109/MRIE66930.2025.11156446",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105018802354&doi=10.1109%2fMRIE66930.2025.11156446&partnerID=40&md5=4c442c9391205c8f0d719c396dc3611b",
    eid: "2-s2.0-105018802354",
    publisher: "IEEE"
  },
  {
    title:
      "Eco-strengthNet: a multi-objective, explainable ensemble and GUI for sustainable concrete optimisation",
    authors: ["Vijarania M.", "Swati", "Jatain A.", "Tipu R.K."],
    year: 2025,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "26",
    issue: "12",
    pages: "5115–5137",
    citedBy: 1,
    doi: "10.1007/s42107-025-01475-9",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105012294048&doi=10.1007%2fs42107-025-01475-9&partnerID=40&md5=e0ce605724d1a878ad674229b4b1e026",
    eid: "2-s2.0-105012294048",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "An ANN-based approach for estimating load capacity and strain in FRP confined concrete columns",
    authors: ["Shang L.", "Isleem H.F.", "Yehia S.A.", "Tipu R.K.", "Hindi K.E."],
    year: 2025,
    venue: "Egyptian Informatics Journal",
    type: "Article",
    volume: "31",
    articleNumber: "100738",
    doi: "10.1016/j.eij.2025.100738",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105010105670&doi=10.1016%2fj.eij.2025.100738&partnerID=40&md5=785569523e78ea21424ef70e6db5088e",
    eid: "2-s2.0-105010105670",
    issn: "11108665",
    publisher: "Elsevier B.V."
  },
  {
    title:
      "Sustainability and economic evaluation of recycled aggregate geopolymer concrete using fly ash and slag",
    authors: ["Rawat M.S.", "Kaloni S.", "Tipu R.K.", "Bhandari P."],
    year: 2025,
    venue: "Journal of Material Cycles and Waste Management",
    type: "Article",
    volume: "27",
    issue: "6",
    pages: "4389–4403",
    doi: "10.1007/s10163-025-02373-7",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105013807135&doi=10.1007%2fs10163-025-02373-7&partnerID=40&md5=fa729696c82f7abf5d79fd87b49dc8fe",
    eid: "2-s2.0-105013807135",
    issn: "14384957",
    publisher: "Springer"
  },
  {
    title:
      "GA–PSO–optimised dual-path attention network for predicting strength of nano/micro-modified alkali-activated concrete",
    authors: ["Sharma N.", "Dewangan A.", "Tiwari V.", "Singh N.", "Tipu R.K.", "Paruthi S."],
    year: 2025,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "26",
    issue: "10",
    pages: "4287–4302",
    citedBy: 1,
    doi: "10.1007/s42107-025-01425-5",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105010601300&doi=10.1007%2fs42107-025-01425-5&partnerID=40&md5=6dd228a9c720633f3cd1bfe2fe693a39",
    eid: "2-s2.0-105010601300",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Hybrid machine learning modelling and feature interpretation of load-carrying capacity of PVC tube-confined concrete columns",
    authors: ["Tipu R.K.", "Verma V.K."],
    year: 2025,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "26",
    issue: "7",
    pages: "2887–2914",
    doi: "10.1007/s42107-025-01350-7",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105004471655&doi=10.1007%2fs42107-025-01350-7&partnerID=40&md5=0a500ccc81c18648599041a691e5b0e2",
    eid: "2-s2.0-105004471655",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Renovation of mix design: Integrated deep learning and Bayesian optimization approach for enhanced prediction of high-performance concrete strength",
    authors: ["Tipu R.K.", "Goyal A.", "Singh D.", "Kumar A.K.A."],
    year: 2025,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "26",
    issue: "6",
    pages: "2371–2390",
    citedBy: 2,
    doi: "10.1007/s42107-025-01313-y",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105000451089&doi=10.1007%2fs42107-025-01313-y&partnerID=40&md5=2327ab76aad7c099a62449d890e78827",
    eid: "2-s2.0-105000451089",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Ensemble machine learning models for predicting concrete compressive strength incorporating various sand types",
    authors: ["Tipu R.K.", "Bansal S.", "Batra V.", "Suman", "Patel G.A."],
    year: 2025,
    venue:
      "Multiscale and Multidisciplinary Modeling, Experiments and Design (MMMED)",
    type: "Article",
    volume: "8",
    issue: "4",
    articleNumber: "222",
    citedBy: 3,
    doi: "10.1007/s41939-025-00812-4",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105000128290&doi=10.1007%2fs41939-025-00812-4&partnerID=40&md5=e476120920eb88a4fab05eadfa99630d",
    eid: "2-s2.0-105000128290",
    issn: "25208160",
    publisher: "Springer"
  },
  {
    title:
      "Learning Smarter, Not Harder: A Unified Strategy for Efficient Representation Learning with Limited Labels",
    authors: ["Goyal A.", "Bhakhar R.", "Tipu R.K.", "Singh S."],
    year: 2025,
    venue:
      "2025 2nd International Conference on Multidisciplinary Research and Innovations in Engineering (MRIE)",
    type: "Conference paper",
    pages: "309–313",
    doi: "10.1109/MRIE66930.2025.11156318",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105018797336&doi=10.1109%2fMRIE66930.2025.11156318&partnerID=40&md5=e622b81f04b610b5ed423084f0c0ee04",
    eid: "2-s2.0-105018797336",
    publisher: "IEEE"
  },
  {
    title:
      "Time-Series Forecasting of Energy Consumption Using LSTM Networks for Optimized Microgrid Management",
    authors: ["Pandya K.S.", "Tipu R.K.", "Pandya J.K."],
    year: 2025,
    venue:
      "1st International Conference on Sustainable Energy Technologies and Computational Intelligence (SETCOM)",
    type: "Conference paper",
    citedBy: 1,
    doi: "10.1109/SETCOM64758.2025.10932629",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105002272710&doi=10.1109%2fSETCOM64758.2025.10932629&partnerID=40&md5=374e6529ee53666c9500b9dce7dcd1d8",
    eid: "2-s2.0-105002272710",
    publisher: "IEEE"
  },
  {
    title:
      "Optimizing sustainable blended concrete mixes using deep learning and multi-objective optimization",
    authors: ["Tipu R.K.", "Rathi P.", "Pandya K.S.", "Panchal V.R."],
    year: 2025,
    venue: "Scientific Reports",
    type: "Article",
    volume: "15",
    issue: "1",
    articleNumber: "16356",
    citedBy: 4,
    doi: "10.1038/S41598-025-00943-1",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105005235726&doi=10.1038%2fS41598-025-00943-1&partnerID=40&md5=385a1f36717681a454bb2e85ee4a9470",
    eid: "2-s2.0-105005235726",
    issn: "20452322",
    publisher: "Nature Research"
  },
  {
    title:
      "Utilization of numerical and machine learning to predict the monotonic compressive response of square double-skin tubular columns (SDSTC)",
    authors: ["Ren Y.", "Isleem H.F.", "Jahami A.", "Tipu R.K."],
    year: 2025,
    venue: "Structures",
    type: "Article",
    volume: "72",
    articleNumber: "108206",
    citedBy: 1,
    doi: "10.1016/j.istruc.2025.108206",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85215563053&doi=10.1016%2fj.istruc.2025.108206&partnerID=40&md5=9d4c7a2c91dd053eae2bc055ba9f1dfc",
    eid: "2-s2.0-85215563053",
    issn: "23520124",
    publisher: "Elsevier Ltd"
  },
  {
    title:
      "Predictive Modelling of Flexural Strength in Recycled Aggregate-Based Concrete: A Comprehensive Approach with Machine Learning and Global Sensitivity Analysis",
    authors: ["Singh R.", "Tipu R.K.", "Mir A.A.", "Patel M."],
    year: 2025,
    venue:
      "Iranian Journal of Science and Technology - Transactions of Civil Engineering",
    type: "Article",
    volume: "49",
    issue: "2",
    pages: "1089–1114",
    citedBy: 17,
    doi: "10.1007/s40996-024-01502-w",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105001474659&doi=10.1007%2fs40996-024-01502-w&partnerID=40&md5=9622515532403ec658745071d0548d05",
    eid: "2-s2.0-105001474659",
    issn: "22286160",
    publisher: "Springer"
  },
  {
    title:
      "Predicting compressive and tensile strength of concrete with different sand types using machine learning",
    authors: ["Abdennaji T.S.", "Tipu R.K.", "Alassaf Y."],
    year: 2025,
    venue: "Ain Shams Engineering Journal",
    type: "Article",
    volume: "16",
    issue: "8",
    articleNumber: "103474",
    doi: "10.1016/j.asej.2025.103474",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105004883135&doi=10.1016%2fj.asej.2025.103474&partnerID=40&md5=ca50cb34401eb6ac97ae945dafb8e930",
    eid: "2-s2.0-105004883135",
    issn: "20904479",
    publisher: "Ain Shams University"
  },
  {
    title:
      "Mitigating V-folding resonance shifts in flexible patch antennas through ground plane resizing",
    authors: ["Kumar A.K.A.", "Kumar B.A.", "Shah O.A.", "Jain A.", "Singh D.", "Tipu R.K."],
    year: 2025,
    venue:
      "Recent Trends in Intelligent Computing and Communication: Volume 1 (CRC Press)",
    type: "Book chapter",
    pages: "527–531",
    doi: "10.1201/9781003593034-83",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105020507378&doi=10.1201%2f9781003593034-83&partnerID=40&md5=cca8b655dafa5859d91b3c4e6e31f576",
    eid: "2-s2.0-105020507378",
    isbn: "978-103297268-8",
    publisher: "CRC Press"
  },
  {
    title:
      "Prediction of Flexural Strength for Coconut Shell Embedded Concrete using Machine Learning Technique",
    authors: ["Tipu R.K.", "Shah O.A.", "Vats S.", "Ahmed T.", "Singh P.", "Verma A."],
    year: 2024,
    venue:
      "15th International Conference on Computing Communication and Networking Technologies (ICCCNT)",
    type: "Conference paper",
    doi: "10.1109/ICCCNT61001.2024.10724458",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85211141616&doi=10.1109%2fICCCNT61001.2024.10724458&partnerID=40&md5=88757706fbf27d5c5d60e77e988a0903",
    eid: "2-s2.0-85211141616",
    publisher: "IEEE"
  },
  {
    title:
      "Predictive Modeling of Compressive Strength in Coconut Shell-Embedded Concrete using Ensemble Regression Models",
    authors: [
      "Tipu R.K.",
      "Shah O.A.",
      "Vats S.",
      "Tomar A.",
      "Khan I.A.",
      "Whig P.",
      "Ali K.B.",
      "Verma A."
    ],
    year: 2024,
    venue:
      "2nd IEEE International Conference on Integrated Intelligence and Communication Systems (ICIICS)",
    type: "Conference paper",
    doi: "10.1109/ICIICS63763.2024.10860255",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85218185432&doi=10.1109%2fICIICS63763.2024.10860255&partnerID=40&md5=5b0781b326c3196faae8e490fb08b565",
    eid: "2-s2.0-85218185432",
    publisher: "IEEE"
  },
  {
    title:
      "ANN-Based Scalable Video Encoding Method for Crime Surveillance-Intelligence of Things Applications",
    authors: ["Agarwal R.", "Pathak P.", "Tipu R.K.", "Singh D.", "Kalnawat A.", "Dhabliya D."],
    year: 2023,
    venue:
      "International Conference on Data Science and Network Security (ICDSNS)",
    type: "Conference paper",
    citedBy: 5,
    doi: "10.1109/ICDSNS58469.2023.10245873",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85173625606&doi=10.1109%2fICDSNS58469.2023.10245873&partnerID=40&md5=1b013a91fc41ad6bd69fa836fd70bdfa",
    eid: "2-s2.0-85173625606",
    publisher: "IEEE"
  },
  {
    title:
      "Efficient compressive strength prediction of concrete incorporating recycled coarse aggregate using Newton's boosted backpropagation neural network (NB-BPNN)",
    authors: ["Tipu R.K.", "Batra V.", "Suman", "Pandya K.S.", "Panchal V.R."],
    year: 2023,
    venue: "Structures",
    type: "Article",
    volume: "58",
    articleNumber: "105559",
    citedBy: 31,
    doi: "10.1016/j.istruc.2023.105559",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85177981139&doi=10.1016%2fj.istruc.2023.105559&partnerID=40&md5=fe465ed4b213e59490166ed669e3bac9",
    eid: "2-s2.0-85177981139",
    issn: "23520124",
    publisher: "Elsevier Ltd"
  },
  {
    title:
      "An enhanced weighted ensemble approach for predicting concrete compressive strength",
    authors: ["Tipu R.K.", "Batra V.", "Suman", "Pandya K.S."],
    year: 2024,
    venue:
      "Multiscale and Multidisciplinary Modeling, Experiments and Design (MMMED)",
    type: "Article",
    volume: "8",
    issue: "7",
    articleNumber: "320",
    doi: "10.1007/s41939-025-00920-1",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105006775193&doi=10.1007%2fs41939-025-00920-1&partnerID=40&md5=72a0c6b6fa05a41116557fd0a4e594f0",
    eid: "2-s2.0-105006775193",
    issn: "25208160",
    publisher: "Springer"
  },
  {
    title:
      "Shear capacity prediction for FRCM-strengthened RC beams using Hybrid ReLU-Activated BPNN model",
    authors: ["Kumar Tipu R.", "Batra V.", "Suman", "Pandya K.S.", "Panchal V.R."],
    year: 2023,
    venue: "Structures",
    type: "Article",
    volume: "58",
    articleNumber: "105432",
    citedBy: 27,
    doi: "10.1016/j.istruc.2023.105432",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85174902915&doi=10.1016%2fj.istruc.2023.105432&partnerID=40&md5=03ed4a7564be88b53ce3828299945458",
    eid: "2-s2.0-85174902915",
    issn: "23520124",
    publisher: "Elsevier Ltd"
  },
  {
    title:
      "Predicting compressive strength of concrete with iron waste: a BPNN approach",
    authors: ["Tipu R.K.", "Batra V.", "Suman", "Pandya K.S.", "Panchal V.R."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "7",
    pages: "5571–5579",
    citedBy: 12,
    doi: "10.1007/s42107-024-01130-9",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85200115481&doi=10.1007%2fs42107-024-01130-9&partnerID=40&md5=54703f718497fcdf46cfdb99138b124a",
    eid: "2-s2.0-85200115481",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Predictive modelling of surface chloride concentration in marine concrete structures: a comparative analysis of machine learning approaches",
    authors: ["Tipu R.K.", "Batra V.", "Suman", "Panchal V.R.", "Pandya K.S."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "2",
    pages: "1443–1465",
    citedBy: 18,
    doi: "10.1007/s42107-023-00854-4",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85166675190&doi=10.1007%2fs42107-023-00854-4&partnerID=40&md5=72ed959aeb4d7c38fe72f89e0e844dca",
    eid: "2-s2.0-85166675190",
    issn: "15630854",
    publisher: "Institute for Ionics / Springer"
  },
  {
    title:
      "Compressive behavior of elliptical concrete-filled steel tubular short columns using numerical investigation and machine learning techniques",
    authors: ["Mohamed H.S.", "Qiong T.", "Isleem H.F.", "Tipu R.K.", "Shahin R.I.", "Yehia S.A.", "Jangir P.", "Arpita", "Khishe M."],
    year: 2024,
    venue: "Scientific Reports",
    type: "Article",
    volume: "14",
    issue: "1",
    articleNumber: "27007",
    citedBy: 37,
    doi: "10.1038/s41598-024-77396-5",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85208689188&doi=10.1038%2fs41598-024-77396-5&partnerID=40&md5=2ae3a2ec8c8bfef71a5b799e05c5abe6",
    eid: "2-s2.0-85208689188",
    issn: "20452322",
    publisher: "Nature Research"
  },
  {
    title:
      "Optimizing compressive strength in sustainable concrete: a machine learning approach with iron waste integration",
    authors: ["Tipu R.K.", "Batra V.", "Suman", "Panchal V.R.", "Pandya K.S.", "Patel G.A."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "6",
    pages: "4487–4512",
    citedBy: 11,
    doi: "10.1007/s42107-024-01061-5",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85193513293&doi=10.1007%2fs42107-024-01061-5&partnerID=40&md5=4893722d8e0c37a61d94983a6e0039f4",
    eid: "2-s2.0-85193513293",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Enhancing chloride concentration prediction in marine concrete using conjugate gradient-optimized backpropagation neural network",
    authors: ["Tipu R.K.", "Panchal V.R.", "Pandya K.S."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "1",
    pages: "637–656",
    citedBy: 22,
    doi: "10.1007/s42107-023-00801-3",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85165213771&doi=10.1007%2fs42107-023-00801-3&partnerID=40&md5=45d8f5b15d4ee6cfd2f3fc4b3ad99dc6",
    eid: "2-s2.0-85165213771",
    issn: "15630854",
    publisher: "Institute for Ionics / Springer"
  },
  {
    title:
      "Predicting Concrete Flow Using Advanced Machine Learning Techniques: Insights and Applications",
    authors: ["Tipu R.K.", "Shah O.A.", "Vats S.", "Tomar A.", "Sohail Md.A.", "Verma A."],
    year: 2024,
    venue:
      "15th International Conference on Computing Communication and Networking Technologies (ICCCNT)",
    type: "Conference paper",
    doi: "10.1109/ICCCNT61001.2024.10725851",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105003906685&doi=10.1109%2fICCCNT61001.2024.10725851&partnerID=40&md5=0839194ed9b94fe45e18dc2bc1bdf1d4",
    eid: "2-s2.0-105003906685",
    publisher: "IEEE"
  },
  {
    title:
      "Numerical and machine learning models for concentrically and eccentrically loaded CFST columns confined with FRP wraps",
    authors: ["Xu C.", "Zhang Y.", "Isleem H.F.", "Qiu D.", "Zhang Y.", "Alsaadawi M.M.", "Tipu R.K.", "El-Demerdash W.E.", "Hamed A.Y."],
    year: 2024,
    venue: "Structural Concrete",
    type: "Article",
    citedBy: 24,
    doi: "10.1002/suco.202400541",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85204649023&doi=10.1002%2fsuco.202400541&partnerID=40&md5=ba216cc7764603ea194e7b3df5df2474",
    eid: "2-s2.0-85204649023",
    issn: "14644177",
    publisher: "John Wiley & Sons"
  },
  {
    title:
      "Deep Learning Projections for High-Performance Concrete Strength Forecasting",
    authors: ["Tipu R.K.", "Shah O.A.", "Vats S.", "Arora S."],
    year: 2024,
    venue:
      "4th International Conference on Innovative Practices in Technology and Management (ICIPTM)",
    type: "Conference paper",
    citedBy: 9,
    doi: "10.1109/ICIPTM59628.2024.10563896",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85197694262&doi=10.1109%2fICIPTM59628.2024.10563896&partnerID=40&md5=c36cbd30331cbefa29990537457b3bd9",
    eid: "2-s2.0-85197694262",
    publisher: "IEEE"
  },
  {
    title:
      "Enhancing Concrete Properties Through the Integration of Recycled Coarse Aggregate: A Machine Learning Approach for Sustainable Construction",
    authors: ["Tipu R.K.", "Shah O.A.", "Vats S.", "Purohit S."],
    year: 2024,
    venue:
      "4th International Conference on Innovative Practices in Technology and Management (ICIPTM)",
    type: "Conference paper",
    citedBy: 12,
    doi: "10.1109/ICIPTM59628.2024.10563490",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85197680005&doi=10.1109%2fICIPTM59628.2024.10563490&partnerID=40&md5=71b8573648003da4b82b995d21c19a89",
    eid: "2-s2.0-85197680005",
    publisher: "IEEE"
  },
  {
    title:
      "Machine learning-based prediction of concrete strength properties with coconut shell as partial aggregate replacement: A sustainable approach in construction engineering",
    authors: ["Tipu R.K.", "Arora R.", "Kumar K."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "3",
    pages: "2979–2992",
    citedBy: 18,
    doi: "10.1007/s42107-023-00957-y",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85180858499&doi=10.1007%2fs42107-023-00957-y&partnerID=40&md5=80fd54ee2b1e644f9f8caa2c64a37e02",
    eid: "2-s2.0-85180858499",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Predictive modeling of shear strength in fiber-reinforced cementitious matrix-strengthened RC beams using machine learning",
    authors: ["Tipu R.K.", "Batra V.", "Suman"],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "4",
    pages: "3251–3261",
    citedBy: 4,
    doi: "10.1007/s42107-023-00976-9",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85184173973&doi=10.1007%2fs42107-023-00976-9&partnerID=40&md5=aa837a979e5a34487280ece9b0beebbd",
    eid: "2-s2.0-85184173973",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Machine learning-based prediction of concrete strengths with coconut shell as partial coarse aggregate replacement: a comprehensive analysis and sensitivity study",
    authors: ["Tipu R.K.", "Panchal V.R.", "Pandya K.S."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "4",
    pages: "3183–3200",
    citedBy: 4,
    doi: "10.1007/s42107-023-00971-0",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85182828317&doi=10.1007%2fs42107-023-00971-0&partnerID=40&md5=12d130d2a586365f589ab9a5ddf14b73",
    eid: "2-s2.0-85182828317",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Prognosis of flow of fly ash and blast furnace slag-based concrete: leveraging advanced machine learning algorithms",
    authors: ["Kumar R.", "Rathore A.", "Singh R.", "Mir A.A.", "Tipu R.K.", "Patel M."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "3",
    pages: "2483–2497",
    citedBy: 26,
    doi: "10.1007/s42107-023-00922-9",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85175968137&doi=10.1007%2fs42107-023-00922-9&partnerID=40&md5=07df1728d6d75c14cd3f2bc39d42c7ef",
    eid: "2-s2.0-85175968137",
    issn: "15630854",
    publisher: "Springer Nature"
  },
  {
    title:
      "Deep Learning Projections for High-Performance Concrete Strength Forecasting",
    authors: ["Tipu R.K.", "Shah O.A.", "Vats S.", "Arora S."],
    year: 2024,
    venue:
      "4th International Conference on Innovative Practices in Technology and Management (ICIPTM)",
    type: "Conference paper",
    doi: "10.1109/ICIPTM59628.2024.10563896",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85197694262&doi=10.1109%2fICIPTM59628.2024.10563896&partnerID=40&md5=c36cbd30331cbefa29990537457b3bd9",
    eid: "2-s2.0-85197694262",
    publisher: "IEEE"
  },
  {
    title:
      "Parametric investigation of coconut shells as partial replacement of coarse aggregates in sustainable concrete",
    authors: ["Arora R.", "Kumar K.", "Dixit S.", "Tipu R.K.", "Kaul P.", "Chauhan S.", "Raju Y.K.", "Nijhawan G.", "Haindavi P."],
    year: 2023,
    venue: "E3S Web of Conferences",
    type: "Conference paper",
    volume: "430",
    articleNumber: "1180",
    citedBy: 3,
    doi: "10.1051/e3sconf/202343001180",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85175448643&doi=10.1051%2fe3sconf%2f202343001180&partnerID=40&md5=5d6ea13d4e4a62ab9ac0ffc4b3058158",
    eid: "2-s2.0-85175448643",
    issn: "25550403",
    publisher: "EDP Sciences"
  },
  {
    title:
      "Enhancing load capacity prediction of column using eReLU-activated BPNN model",
    authors: ["Tipu R.K.", "Batra V.", "Suman", "Pandya K.S.", "Panchal V.R."],
    year: 2023,
    venue: "Structures",
    type: "Article",
    volume: "58",
    articleNumber: "105600",
    citedBy: 25,
    doi: "10.1016/j.istruc.2023.105600",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85178996783&doi=10.1016%2fj.istruc.2023.105600&partnerID=40&md5=9a17915d6116def19dd2eb6e8041cd59",
    eid: "2-s2.0-85178996783",
    issn: "23520124",
    publisher: "Elsevier Ltd"
  },
  {
    title:
      "An ensemble approach to improve BPNN model precision for predicting compressive strength of high-performance concrete",
    authors: ["Kumar Tipu R.", "Panchal V.R.", "Pandya K.S."],
    year: 2022,
    venue: "Structures",
    type: "Article",
    volume: "45",
    pages: "500–508",
    citedBy: 71,
    doi: "10.1016/j.istruc.2022.09.046",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85138155308&doi=10.1016%2fj.istruc.2022.09.046&partnerID=40&md5=d3377e13d47fd6719247d6cacecf4145",
    eid: "2-s2.0-85138155308",
    issn: "23520124",
    publisher: "Elsevier Ltd"
  },
  {
    title:
      "Multi-objective optimized high-strength concrete mix design using a hybrid machine learning and metaheuristic algorithm",
    authors: ["Tipu R.K.", "Panchal V.R.", "Pandya K.S."],
    year: 2023,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "24",
    issue: "3",
    pages: "849–867",
    citedBy: 32,
    doi: "10.1007/s42107-022-00535-8",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85143211425&doi=10.1007%2fs42107-022-00535-8&partnerID=40&md5=73e14ed95d29db9ed7c889bf62bd16db",
    eid: "2-s2.0-85143211425",
    issn: "15630854",
    publisher: "Institute for Ionics / Springer"
  },
  {
    title:
      "Development of a hybrid stacked machine learning model for predicting compressive strength of high-performance concrete",
    authors: ["Tipu R.K.", "Suman", "Batra V."],
    year: 2023,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "24",
    issue: "8",
    pages: "2985–3000",
    citedBy: 31,
    doi: "10.1007/s42107-023-00689-z",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85159106299&doi=10.1007%2fs42107-023-00689-z&partnerID=40&md5=97965e535f62260cc88a70fff839dd00",
    eid: "2-s2.0-85159106299",
    issn: "15630854",
    publisher: "Institute for Ionics / Springer"
  },
  {
    title:
      "Enhancing prediction accuracy of workability and compressive strength of high-performance concrete through extended dataset and improved machine learning models",
    authors: ["Tipu R.K.", "Suman", "Batra V."],
    year: 2024,
    venue: "Asian Journal of Civil Engineering",
    type: "Article",
    volume: "25",
    issue: "1",
    pages: "197–218",
    citedBy: 26,
    doi: "10.1007/s42107-023-00768-1",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85163289563&doi=10.1007%2fs42107-023-00768-1&partnerID=40&md5=e5b6d28167aa2f0c69a377f04906462d",
    eid: "2-s2.0-85163289563",
    issn: "15630854",
    publisher: "Institute for Ionics / Springer"
  },
  {
    title:
      "Prediction of concrete properties using machine learning algorithm",
    authors: ["Tipu R.K.", "Panchal V.R.", "Pandya K.S."],
    year: 2022,
    venue: "Journal of Physics: Conference Series",
    type: "Conference paper",
    volume: "2273",
    issue: "1",
    articleNumber: "012016",
    citedBy: 23,
    doi: "10.1088/1742-6596/2273/1/012016",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85132746123&doi=10.1088%2f1742-6596%2f2273%2f1%2f012016&partnerID=40&md5=77dca4a352e6268a2cde69e1731d8d34",
    eid: "2-s2.0-85132746123",
    issn: "17426588",
    publisher: "IOP Publishing"
  },
  {
    title:
      "Multi-objective Optimization of the Concrete Mixture Blended with Mineral Admixture Using Machine Learning and NSGA-II Algorithms",
    authors: ["Tipu R.K.", "Panchal V.R.", "Pandya K.S."],
    year: 2023,
    venue: "Lecture Notes in Mechanical Engineering",
    type: "Conference paper",
    pages: "165–174",
    citedBy: 7,
    doi: "10.1007/978-981-19-9285-8_16",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85159090848&doi=10.1007%2f978-981-19-9285-8_16&partnerID=40&md5=5469f318b4d95e3c6b5b85852adde1b9",
    eid: "2-s2.0-85159090848",
    isbn: "978-981199284-1",
    publisher: "Springer"
  },
  {
    title:
      "Predictive Modeling of Shear Capacity for FRCM-Strengthened RC Beams using MLP Neural Networks and Global Sensitivity Analysis for Sustainable Construction",
    authors: ["Shah O.A.", "Tipu R.K.", "Vats S.", "Purohit S.", "Bansal S.", "Yadav A.K.", "Verma A."],
    year: 2024,
    venue:
      "IEEE Flagship International BIT Conference: Next Generation Applications in Green Energy Technology (BITCON)",
    type: "Conference paper",
    doi: "10.1109/BITCON63716.2024.10985715",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-105008282022&doi=10.1109%2fBITCON63716.2024.10985715&partnerID=40&md5=345a6429cbe2bb82e7032bdd037ff937",
    eid: "2-s2.0-105008282022",
    publisher: "IEEE"
  },
  {
    title:
      "The future of digital marketing: Leveraging artificial intelligence for competitive strategies and tactics",
    authors: ["Raghav Y.Y.", "Tipu R.K.", "Bhakhar R.", "Gupta T.", "Sharma K."],
    year: 2023,
    venue:
      "The Use of Artificial Intelligence in Digital Marketing: Competitive Strategies and Tactics (IGI Global)",
    type: "Book chapter",
    pages: "249–274",
    citedBy: 14,
    doi: "10.4018/978-1-6684-9324-3.ch011",
    url: "https://www.scopus.com/inward/record.uri?eid=2-s2.0-85179898230&doi=10.4018%2f978-1-6684-9324-3.ch011&partnerID=40&md5=968a3e5929da10f72667ba53fdb1a197",
    eid: "2-s2.0-85179898230",
    publisher: "IGI Global"
  }
  // ----
  // NOTE:
  // The list above captures all entries you shared that involve Rupesh Kumar Tipu,
  // spanning 2022–2025 across journals, conferences, and book chapters.
  // If you’d like, we can also split this into `journal`, `conference`, and `chapter`
  // arrays or add fields like `isOpenAccess` per item for badge rendering.
];

export default publications;
