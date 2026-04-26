import numpy as np

def transform_input(data):

    # ===== BASIC =====
    age = float(data.get("AGE", 0))
    income = float(data.get("AMT_INCOME_TOTAL", 0))
    credit = float(data.get("AMT_CREDIT", 0))
    annuity = float(data.get("AMT_ANNUITY", 0))
    family = float(data.get("CNT_FAM_MEMBERS", 1))
    children = float(data.get("CNT_CHILDREN", 0))

    # ===== EXT SOURCES =====
    ext1 = float(data.get("EXT_SOURCE_1", 0.6))
    ext2 = float(data.get("EXT_SOURCE_2", 0.6))
    ext3 = float(data.get("EXT_SOURCE_3", 0.6))

    ext_mean = (ext1 + ext2 + ext3) / 3
    ext_min = min(ext1, ext2, ext3)
    ext_max = max(ext1, ext2, ext3)
    ext_std = np.std([ext1, ext2, ext3])

    # ===== RATIOS =====
    credit_income_ratio = credit / income if income > 0 else 0
    annuity_income_ratio = annuity / income if income > 0 else 0
    credit_term = credit / annuity if annuity > 0 else 0
    log_income = np.log(income) if income > 0 else 0
    income_per_person = income / family if family > 0 else 0
    children_ratio = children / family if family > 0 else 0

    # ===== JOB =====
    income_type = data.get("NAME_INCOME_TYPE", "Working")
    is_stable_job = 1 if income_type in ["Working", "State servant", "Pensioner"] else 0

    # ===== EDUCATION =====
    edu = data.get("NAME_EDUCATION_TYPE", "Secondary")
    high_edu = 1 if edu in ["Higher education", "Incomplete higher"] else 0
    low_edu = 1 if edu == "Lower secondary" else 0

    # ===== FAMILY =====
    fam = data.get("NAME_FAMILY_STATUS", "Married")
    is_married = 1 if fam == "Married" else 0
    is_single = 1 if fam in ["Single / Separated"] else 0
    is_widow = 1 if fam == "Widow" else 0

    # ===== HOUSING =====
    housing = data.get("HOUSING_TYPE", "Own house")
    is_own = 1 if housing == "Own house" else 0
    is_rent = 1 if housing == "Rent" else 0
    is_other = 1 if housing == "Other" else 0

    # ===== CAR =====
    car_age = float(data.get("OWN_CAR_AGE", -1))
    has_car = 1 if car_age >= 0 else 0
    new_car = 1 if car_age >= 0 and car_age <= 2 else 0

    # ===== CONTACT =====
    contact = int(data.get("CONTACT_COUNT", 1))
    multi_contact = 1 if contact > 1 else 0

    # ===== ADDRESS =====
    addr = int(data.get("ADDRESS_MISMATCH_COUNT", 0))
    high_addr = 1 if addr >= 2 else 0

    # ===== SOCIAL =====
    obs = float(data.get("OBS_30_CNT_SOCIAL_CIRCLE", 0))
    d30 = float(data.get("DEF_30_CNT_SOCIAL_CIRCLE", 0))

    total_obs = obs
    total_def = d30

    def30_ratio = d30 / (obs + 1)
    def60_ratio = d30 / (obs + 1)

    # ===== DOCUMENT =====
    doc = int(data.get("DOC_COUNT", 0))
    has_doc = 1 if doc > 0 else 0
    high_doc = 1 if doc > 5 else 0

    # ===== ENQUIRIES =====
    week = float(data.get("AMT_REQ_CREDIT_BUREAU_WEEK", 0))
    year = float(data.get("AMT_REQ_CREDIT_BUREAU_YEAR", 0))

    total_enq = week + year
    recent_enq = week
    long_enq = year - week
    urgent = 1 if week > 2 else 0
    high_enq = 1 if total_enq > 5 else 0

    # ===== EMPLOYMENT =====
    emp = float(data.get("YEARS_EMPLOYED", 0))
    is_unemployed = 1 if emp == 0 else 0
    emp_age_ratio = emp / (age + 1)

    # ===== CREDIT RATIO =====
    credit_annuity_ratio = credit / (annuity + 1)

    # ===== FINAL DICT =====
    return {
        'NAME_CONTRACT_TYPE': 1 if data.get("NAME_CONTRACT_TYPE") == "Revolving loans" else 0,
        'CODE_GENDER': data.get("CODE_GENDER", 0),
        'FLAG_OWN_REALTY': data.get("FLAG_OWN_REALTY", 1),

        'CNT_CHILDREN': children,
        'AMT_INCOME_TOTAL': income,
        'AMT_CREDIT': credit,
        'AMT_ANNUITY': annuity,
        'AMT_GOODS_PRICE': data.get("AMT_GOODS_PRICE", credit),

        'REGION_POPULATION_RELATIVE': data.get("REGION_POPULATION_RELATIVE", 0.02),
        'OWN_CAR_AGE': car_age,
        'CNT_FAM_MEMBERS': family,

        'EXT_SOURCE_1': ext1,
        'EXT_SOURCE_2': ext2,
        'EXT_SOURCE_3': ext3,

        'IS_STABLE_JOB': is_stable_job,
        'IS_ALONE': 1 if family == 1 else 0,

        'CREDIT_INCOME_RATIO': credit_income_ratio,
        'ANNUITY_INCOME_RATIO': annuity_income_ratio,
        'CREDIT_TERM': credit_term,
        'LOG_INCOME': log_income,

        'HIGH_EDUCATION': high_edu,
        'LOW_EDUCATION': low_edu,

        'IS_MARRIED': is_married,
        'IS_SINGLE': is_single,
        'IS_WIDOW': is_widow,

        'AGE': age,
        'YEARS_EMPLOYED': emp,
        'YEARS_REGISTRATION': 5,
        'YEARS_ID_PUBLISH': 5,

        'IS_OWN_HOUSE': is_own,
        'IS_RENTED': is_rent,
        'IS_OTHER_HOUSING': is_other,

        'HAS_CAR': has_car,
        'NEW_CAR': new_car,

        'CONTACT_COUNT': contact,
        'HAS_MULTIPLE_CONTACTS': multi_contact,

        'CHILDREN_RATIO': children_ratio,
        'REGION_RATING_DIFF': 0,

        'HIGH_SKILL_JOB': 1 if data.get("SKILL_TYPE") == "High skill" else 0,
        'LOW_SKILL_JOB': 1 if data.get("SKILL_TYPE") == "Low skill" else 0,

        'ADDRESS_MISMATCH_COUNT': addr,
        'HIGH_ADDRESS_MISMATCH': high_addr,

        'EXT_SOURCE_MEAN': ext_mean,
        'EXT_SOURCE_MIN': ext_min,
        'EXT_SOURCE_MAX': ext_max,
        'EXT_SOURCE_STD': ext_std,

        'STABLE_ORG': 1 if data.get("ORG_TYPE") == "Stable org" else 0,
        'RISKY_ORG': 1 if data.get("ORG_TYPE") == "Risky org" else 0,

        'DEF_30_RATIO': def30_ratio,
        'DEF_60_RATIO': def60_ratio,
        'TOTAL_SOCIAL_OBS': total_obs,
        'TOTAL_SOCIAL_DEF': total_def,

        'YEARS_LAST_PHONE_CHANGE': data.get("YEARS_LAST_PHONE_CHANGE", 1),
        'RECENT_PHONE_CHANGE': 1 if data.get("YEARS_LAST_PHONE_CHANGE", 1) < 2 else 0,

        'DOC_COUNT': doc,
        'HAS_DOCUMENTS': has_doc,
        'HIGH_DOC_COUNT': high_doc,

        'TOTAL_ENQUIRIES': total_enq,
        'RECENT_ENQUIRIES': recent_enq,
        'LONG_TERM_ENQUIRIES': long_enq,
        'URGENT_CREDIT_SEEKER': urgent,
        'HIGH_ENQUIRIES': high_enq,

        'INCOME_PER_PERSON': income_per_person,
        'EMPLOYED_TO_AGE_RATIO': emp_age_ratio,
        'CREDIT_TO_ANNUITY_RATIO': credit_annuity_ratio,

        'IS_UNEMPLOYED': is_unemployed,
    }