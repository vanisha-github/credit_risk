def preprocess_data(df):

    df = df.copy()  # avoid modifying original

    # -----------------------------
    # 1. NAME_INCOME_TYPE grouping + feature + encoding
    # -----------------------------
    rare_categories = ['Student', 'Businessman', 'Maternity leave']

    # clean + compact
    df['NAME_INCOME_TYPE'] = df['NAME_INCOME_TYPE'].replace(rare_categories, 'Other')

    df['IS_STABLE_JOB'] = df['NAME_INCOME_TYPE'].isin([
    'Working', 'State servant', 'Pensioner'
    ]).astype(int)

    df = df.drop(columns=['NAME_INCOME_TYPE'], errors='ignore')

    # -----------------------------
    # 2. NAME_TYPE_SUITE → IS_ALONE
    # -----------------------------
    df['IS_ALONE'] = (df['NAME_TYPE_SUITE'] == 'Unaccompanied').astype(int)

    df = df.drop(columns=['NAME_TYPE_SUITE'], errors='ignore')


    # -----------------------------
    # 3. Financial ratios
    # -----------------------------
    df['CREDIT_INCOME_RATIO'] = df['AMT_CREDIT'] / df['AMT_INCOME_TOTAL']
    df['ANNUITY_INCOME_RATIO'] = df['AMT_ANNUITY'] / df['AMT_INCOME_TOTAL']
    df['CREDIT_TERM'] = df['AMT_ANNUITY'] / df['AMT_CREDIT']


    # -----------------------------
    # 4. Log transform
    # -----------------------------
    df['LOG_INCOME'] = np.log1p(df['AMT_INCOME_TOTAL'])

      # -----------------------------
# NAME_EDUCATION_TYPE processing
# -----------------------------

# # Handle rare category
    df['NAME_EDUCATION_TYPE'] = df['NAME_EDUCATION_TYPE'].replace({
    'Academic degree': 'Higher education'
    })

# High-level feature
    df['HIGH_EDUCATION'] = df['NAME_EDUCATION_TYPE'].isin([
    'Higher education', 'Incomplete higher'
    ]).astype(int)

# Low education risk
    df['LOW_EDUCATION'] = (df['NAME_EDUCATION_TYPE'] == 'Lower secondary').astype(int)

# Drop original column (NO dummies)
    df = df.drop(columns=['NAME_EDUCATION_TYPE'], errors='ignore')

# -----------------------------
# NAME_FAMILY_STATUS processing
# -----------------------------

# Handle invalid category
    df['NAME_FAMILY_STATUS'] = df['NAME_FAMILY_STATUS'].replace('Unknown', np.nan)

# Group categories
    df['NAME_FAMILY_STATUS'] = df['NAME_FAMILY_STATUS'].replace({
    'Civil marriage': 'Married'
    })

# Create features
    df['IS_MARRIED'] = df['NAME_FAMILY_STATUS'].isin(['Married']).astype(int)

    df['IS_SINGLE'] = df['NAME_FAMILY_STATUS'].isin([
    'Single / not married', 'Separated'
    ]).astype(int)

    df['IS_WIDOW'] = (df['NAME_FAMILY_STATUS'] == 'Widow').astype(int)

    # Drop original column (IMPORTANT)
    df = df.drop(columns=['NAME_FAMILY_STATUS'], errors='ignore')

    df['AGE'] = -df['DAYS_BIRTH'] / 365
    df = df.drop(columns=['DAYS_BIRTH'])

    df['DAYS_EMPLOYED'] = df['DAYS_EMPLOYED'].replace(365243, np.nan)

    df['YEARS_EMPLOYED'] = -df['DAYS_EMPLOYED'] / 365
    df['YEARS_REGISTRATION'] = -df['DAYS_REGISTRATION'] / 365
    df['YEARS_ID_PUBLISH'] = -df['DAYS_ID_PUBLISH'] / 365

# -----------------------------
# NAME_HOUSING_TYPE processing
# -----------------------------

    # 1. Create ownership flag
    df['IS_OWN_HOUSE'] = (df['NAME_HOUSING_TYPE'] == 'House / apartment').astype(int)

# 2. Create rental / dependency flag
    df['IS_RENTED'] = df['NAME_HOUSING_TYPE'].isin([
    'Rented apartment', 'With parents'
    ]).astype(int)

# 3. Optional: create "other housing risk" (advanced, optional)
    df['IS_OTHER_HOUSING'] = df['NAME_HOUSING_TYPE'].isin([
    'Municipal apartment', 'Office apartment', 'Co-op apartment'
    ]).astype(int)

# 4. Drop original column
    df = df.drop(columns=['NAME_HOUSING_TYPE'], errors='ignore')

# -----------------------------
# OWN_CAR_AGE processing
# -----------------------------

# 1. Create "has car" feature (VERY IMPORTANT)
    df['HAS_CAR'] = df['OWN_CAR_AGE'].notnull().astype(int)

# 2. Cap extreme values (outliers)
    df['OWN_CAR_AGE'] = df['OWN_CAR_AGE'].clip(upper=50)

# 3. Fill missing with -1 (indicates no car)
    df['OWN_CAR_AGE'] = df['OWN_CAR_AGE'].fillna(-1)

# 4. Optional: create "new car" feature (advanced)
    df['NEW_CAR'] = (df['OWN_CAR_AGE'] >= 0) & (df['OWN_CAR_AGE'] <= 5)
    df['NEW_CAR'] = df['NEW_CAR'].astype(int)

# -----------------------------
# CONTACT FEATURES (combine)
# -----------------------------

    contact_cols = [
    'FLAG_WORK_PHONE',
    'FLAG_CONT_MOBILE',
    'FLAG_PHONE',
    'FLAG_EMAIL', 'FLAG_MOBIL', 'FLAG_EMP_PHONE'
    ]

# total contact count
    df['CONTACT_COUNT'] = df[contact_cols].sum(axis=1)

# strong availability flag
    df['HAS_MULTIPLE_CONTACTS'] = (df['CONTACT_COUNT'] >= 2).astype(int)

# OPTIONAL: drop originals (recommended)
    df = df.drop(columns=contact_cols, errors='ignore')

# -----------------------------
# FAMILY SIZE
# -----------------------------

# fill missing
    df['CNT_FAM_MEMBERS'] = df['CNT_FAM_MEMBERS'].fillna(df['CNT_FAM_MEMBERS'].median())

# create ratio (advanced)
    df['CHILDREN_RATIO'] = df['CNT_CHILDREN'] / df['CNT_FAM_MEMBERS']

# -----------------------------
# REGION RATINGS
# -----------------------------

# difference feature (VERY IMPORTANT)
    df['REGION_RATING_DIFF'] = df['REGION_RATING_CLIENT'] - df['REGION_RATING_CLIENT_W_CITY']

# -----------------------------
# OCCUPATION_TYPE processing
# -----------------------------

# 1. Fill missing (IMPORTANT)
    df['OCCUPATION_TYPE'] = df['OCCUPATION_TYPE'].fillna('Unknown')

# 2. Group into meaningful buckets
    df['OCCUPATION_TYPE'] = df['OCCUPATION_TYPE'].replace({

    # Low skill / high risk
    'Laborers': 'Low_skill',
    'Low-skill Laborers': 'Low_skill',
    'Cleaning staff': 'Low_skill',
    'Cooking staff': 'Low_skill',
    'Drivers': 'Low_skill',
    'Security staff': 'Low_skill',
    'Waiters/barmen staff': 'Low_skill',

    # Medium skill
    'Sales staff': 'Sales',
    'Core staff': 'Mid_skill',
    'Private service staff': 'Mid_skill',

    # High skill / stable
    'Managers': 'High_skill',
    'Accountants': 'High_skill',
    'High skill tech staff': 'High_skill',
    'IT staff': 'High_skill',
    'Medicine staff': 'High_skill',

    # Rare → group
    'Secretaries': 'Other',
    'HR staff': 'Other',
    'Realty agents': 'Other'
    })

# 3. Create high-level feature (VERY IMPORTANT)
    df['HIGH_SKILL_JOB'] = df['OCCUPATION_TYPE'].isin(['High_skill']).astype(int)

# 4. Create low-skill risk flag (advanced)
    df['LOW_SKILL_JOB'] = df['OCCUPATION_TYPE'].isin(['Low_skill']).astype(int)

# 5. Encode
    df = df.drop(columns=['OCCUPATION_TYPE'], errors='ignore')

    df = df.drop(columns=[
    'WEEKDAY_APPR_PROCESS_START',
    'HOUR_APPR_PROCESS_START'
    ], errors='ignore')

# -----------------------------
# ADDRESS MISMATCH FEATURES
# -----------------------------

    addr_cols = [
    'REG_REGION_NOT_WORK_REGION',
    'LIVE_REGION_NOT_WORK_REGION',
    'REG_CITY_NOT_LIVE_CITY',
    'REG_CITY_NOT_WORK_CITY',
    'LIVE_CITY_NOT_WORK_CITY',
    'REG_REGION_NOT_LIVE_REGION'
    ]

# total mismatch count
    df['ADDRESS_MISMATCH_COUNT'] = df[addr_cols].sum(axis=1)

# high risk flag
    df['HIGH_ADDRESS_MISMATCH'] = (df['ADDRESS_MISMATCH_COUNT'] >= 2).astype(int)

# OPTIONAL: drop originals (recommended)
    df = df.drop(columns=addr_cols, errors='ignore')

    df = df.drop(columns=[
    'DAYS_EMPLOYED',
    'DAYS_REGISTRATION',
    'DAYS_ID_PUBLISH'
    ], errors='ignore')

# -----------------------------
# EXT_SOURCE FEATURES (CRITICAL)
# -----------------------------

# 5. Fill missing (important)
    df[['EXT_SOURCE_1','EXT_SOURCE_2','EXT_SOURCE_3']] = \
    df[['EXT_SOURCE_1','EXT_SOURCE_2','EXT_SOURCE_3']].fillna(
        df[['EXT_SOURCE_1','EXT_SOURCE_2','EXT_SOURCE_3']].median()
    )


# 1. Mean score (strong)
    df['EXT_SOURCE_MEAN'] = df[['EXT_SOURCE_1', 'EXT_SOURCE_2', 'EXT_SOURCE_3']].mean(axis=1)

# 2. Min score (risk indicator)
    df['EXT_SOURCE_MIN'] = df[['EXT_SOURCE_1', 'EXT_SOURCE_2', 'EXT_SOURCE_3']].min(axis=1)

# 3. Max score
    df['EXT_SOURCE_MAX'] = df[['EXT_SOURCE_1', 'EXT_SOURCE_2', 'EXT_SOURCE_3']].max(axis=1)

# 4. Std deviation (consistency)
    df['EXT_SOURCE_STD'] = df[['EXT_SOURCE_1', 'EXT_SOURCE_2', 'EXT_SOURCE_3']].std(axis=1)
    # -----------------------------
# ORGANIZATION_TYPE processing
# -----------------------------

# 1. Replace XNA with explicit label
    df['ORGANIZATION_TYPE'] = df['ORGANIZATION_TYPE'].replace('XNA', 'Unknown')

# 2. Group into broad categories
    df['ORG_TYPE_GROUP'] = df['ORGANIZATION_TYPE'].replace({

    # Stable sectors (low risk)
    'Government': 'Stable',
    'School': 'Stable',
    'University': 'Stable',
    'Police': 'Stable',
    'Military': 'Stable',
    'Bank': 'Stable',

    # Business / corporate
    'Business Entity Type 1': 'Business',
    'Business Entity Type 2': 'Business',
    'Business Entity Type 3': 'Business',

    # Services
    'Medicine': 'Service',
    'Transport: type 2': 'Service',
    'Transport: type 3': 'Service',
    'Transport: type 4': 'Service',
    'Postal': 'Service',

    # Risky / unstable
    'Self-employed': 'Risky',
    'Construction': 'Risky',
    'Agriculture': 'Risky',

    })

# 3. Create high-level features (VERY IMPORTANT)
    df['STABLE_ORG'] = (df['ORG_TYPE_GROUP'] == 'Stable').astype(int)
    df['RISKY_ORG'] = (df['ORG_TYPE_GROUP'] == 'Risky').astype(int)

# 4. Encode grouped category
    df = pd.get_dummies(df, columns=['ORG_TYPE_GROUP'], drop_first=True)

# 5. DROP ORIGINAL (IMPORTANT)
    df = df.drop(columns=['ORGANIZATION_TYPE'])

# -----------------------------
# SOCIAL CIRCLE + PHONE FEATURES
# -----------------------------

# 1. SOCIAL CIRCLE FEATURES
    social_cols = [
    'OBS_30_CNT_SOCIAL_CIRCLE',
    'DEF_30_CNT_SOCIAL_CIRCLE',
    'OBS_60_CNT_SOCIAL_CIRCLE',
    'DEF_60_CNT_SOCIAL_CIRCLE'
    ]

# fill missing
    df[social_cols] = df[social_cols].fillna(0)

# create ratios (important)
    df['DEF_30_RATIO'] = df['DEF_30_CNT_SOCIAL_CIRCLE'] / (df['OBS_30_CNT_SOCIAL_CIRCLE'] + 1)
    df['DEF_60_RATIO'] = df['DEF_60_CNT_SOCIAL_CIRCLE'] / (df['OBS_60_CNT_SOCIAL_CIRCLE'] + 1)

# aggregate features
    df['TOTAL_SOCIAL_OBS'] = df['OBS_30_CNT_SOCIAL_CIRCLE'] + df['OBS_60_CNT_SOCIAL_CIRCLE']
    df['TOTAL_SOCIAL_DEF'] = df['DEF_30_CNT_SOCIAL_CIRCLE'] + df['DEF_60_CNT_SOCIAL_CIRCLE']

# drop original social columns
    df = df.drop(columns=social_cols, errors='ignore')


# 2. DAYS_LAST_PHONE_CHANGE
    df['YEARS_LAST_PHONE_CHANGE'] = -df['DAYS_LAST_PHONE_CHANGE'] / 365

# recent change flag
    df['RECENT_PHONE_CHANGE'] = (df['YEARS_LAST_PHONE_CHANGE'] < 1).astype(int)

# drop original
    df = df.drop(columns=['DAYS_LAST_PHONE_CHANGE'], errors='ignore')

# -----------------------------
# DOCUMENT FEATURES
# -----------------------------

# get all document columns
    doc_cols = [col for col in df.columns if 'FLAG_DOCUMENT' in col]

# total documents submitted
    df['DOC_COUNT'] = df[doc_cols].sum(axis=1)

# strong documentation flag
    df['HAS_DOCUMENTS'] = (df['DOC_COUNT'] > 0).astype(int)

# high documentation (advanced)
    df['HIGH_DOC_COUNT'] = (df['DOC_COUNT'] >= 3).astype(int)

# drop original columns
    df = df.drop(columns=doc_cols, errors='ignore')

# -----------------------------
# CREDIT BUREAU ENQUIRY FEATURES
# -----------------------------

    bureau_cols = [
    'AMT_REQ_CREDIT_BUREAU_HOUR',
    'AMT_REQ_CREDIT_BUREAU_DAY',
    'AMT_REQ_CREDIT_BUREAU_WEEK',
    'AMT_REQ_CREDIT_BUREAU_MON',
    'AMT_REQ_CREDIT_BUREAU_QRT',
    'AMT_REQ_CREDIT_BUREAU_YEAR'
    ]

# 1. Fill missing with 0 (safe)
    df[bureau_cols] = df[bureau_cols].fillna(0)

# 2. Total enquiries (important)
    df['TOTAL_ENQUIRIES'] = df[bureau_cols].sum(axis=1)

# 3. Recent enquiries (VERY IMPORTANT)
    df['RECENT_ENQUIRIES'] = (
    df['AMT_REQ_CREDIT_BUREAU_HOUR'] +
    df['AMT_REQ_CREDIT_BUREAU_DAY'] +
    df['AMT_REQ_CREDIT_BUREAU_WEEK']
    )

# 4. Long-term enquiries
    df['LONG_TERM_ENQUIRIES'] = (
    df['AMT_REQ_CREDIT_BUREAU_MON'] +
    df['AMT_REQ_CREDIT_BUREAU_QRT'] +
    df['AMT_REQ_CREDIT_BUREAU_YEAR']
    )

# 5. Urgent credit behavior flag (advanced)
    df['URGENT_CREDIT_SEEKER'] = (df['RECENT_ENQUIRIES'] >= 2).astype(int)

# 6. High enquiry flag
    df['HIGH_ENQUIRIES'] = (df['TOTAL_ENQUIRIES'] >= 5).astype(int)

# 7. Drop original columns
    df = df.drop(columns=bureau_cols, errors='ignore')

    df = df.drop(columns=[
    'APARTMENTS_AVG',
    'BASEMENTAREA_AVG',
    'YEARS_BEGINEXPLUATATION_AVG',
    'YEARS_BUILD_AVG',
    'COMMONAREA_AVG',
    'ELEVATORS_AVG',
    'ENTRANCES_AVG',
    'FLOORSMAX_AVG',
    'FLOORSMIN_AVG',
    'LANDAREA_AVG',
    'LIVINGAPARTMENTS_AVG',
    'LIVINGAREA_AVG',
    'NONLIVINGAPARTMENTS_AVG',
    'NONLIVINGAREA_AVG',

    'APARTMENTS_MODE',
    'BASEMENTAREA_MODE',
    'YEARS_BEGINEXPLUATATION_MODE',
    'YEARS_BUILD_MODE',
    'COMMONAREA_MODE',
    'ELEVATORS_MODE',
    'ENTRANCES_MODE',
    'FLOORSMAX_MODE',
    'FLOORSMIN_MODE',
    'LANDAREA_MODE',
    'LIVINGAPARTMENTS_MODE',
    'LIVINGAREA_MODE',
    'NONLIVINGAPARTMENTS_MODE',
    'NONLIVINGAREA_MODE',

    'APARTMENTS_MEDI',
    'BASEMENTAREA_MEDI',
    'YEARS_BEGINEXPLUATATION_MEDI',
    'YEARS_BUILD_MEDI',
    'COMMONAREA_MEDI',
    'ELEVATORS_MEDI',
    'ENTRANCES_MEDI',
    'FLOORSMAX_MEDI',
    'FLOORSMIN_MEDI',
    'LANDAREA_MEDI',
    'LIVINGAPARTMENTS_MEDI',
    'LIVINGAREA_MEDI',
    'NONLIVINGAPARTMENTS_MEDI',
    'NONLIVINGAREA_MEDI',
    'FONDKAPREMONT_MODE',
    'HOUSETYPE_MODE',
    'TOTALAREA_MODE',
    'WALLSMATERIAL_MODE',
    'EMERGENCYSTATE_MODE', 'FLAG_OWN_CAR', 'REGION_RATING_CLIENT', 'REGION_RATING_CLIENT_W_CITY'
    ], errors='ignore')

    # -----------------------------
# FINAL CLEANUP
# -----------------------------

    # Financial ratios
    df['INCOME_PER_PERSON'] = df['AMT_INCOME_TOTAL'] / df['CNT_FAM_MEMBERS']

    # ==============================
# ==============================
# FIX NEW FEATURE NULLS
# ==============================
    df['EMPLOYED_TO_AGE_RATIO'] = df['YEARS_EMPLOYED'] / (df['AGE'] + 1)
    df['CREDIT_TO_ANNUITY_RATIO'] = df['AMT_CREDIT'] / (df['AMT_ANNUITY'] + 1)

    df['EMPLOYED_TO_AGE_RATIO'] = df['EMPLOYED_TO_AGE_RATIO'].replace([np.inf, -np.inf], np.nan)
    df['CREDIT_TO_ANNUITY_RATIO'] = df['CREDIT_TO_ANNUITY_RATIO'].replace([np.inf, -np.inf], np.nan)

# fill with median
    df['EMPLOYED_TO_AGE_RATIO'].fillna(df['EMPLOYED_TO_AGE_RATIO'].median(), inplace=True)
    df['CREDIT_TO_ANNUITY_RATIO'].fillna(df['CREDIT_TO_ANNUITY_RATIO'].median(), inplace=True)

# ==============================
# CLIP OUTLIERS
# ==============================

    df['AMT_INCOME_TOTAL'] = np.clip(df['AMT_INCOME_TOTAL'], 0, 1e6)
    df['AMT_CREDIT'] = np.clip(df['AMT_CREDIT'], 0, 2e6)# 2. Drop excessive org dummy columns
    org_cols = [col for col in df.columns if col.startswith('ORG_TYPE_GROUP_')]
    df = df.drop(columns=org_cols, errors='ignore')

# 3. Convert boolean to int
    bool_cols = df.select_dtypes(include='bool').columns
    df[bool_cols] = df[bool_cols].astype(int)


    df['NAME_CONTRACT_TYPE'] = (df['NAME_CONTRACT_TYPE'] == 'Revolving loans').astype(int)
    df['CODE_GENDER'] = (df['CODE_GENDER'] == 'M').astype(int)
    df['FLAG_OWN_REALTY'] = (df['FLAG_OWN_REALTY'] == 'Y').astype(int)

    # create flag (VERY IMPORTANT)
    df['IS_UNEMPLOYED'] = df['YEARS_EMPLOYED'].isnull().astype(int)

# then fill

    df['YEARS_EMPLOYED'] = df['YEARS_EMPLOYED'].fillna(0)
    df['AMT_GOODS_PRICE'] = df['AMT_GOODS_PRICE'].fillna(df['AMT_GOODS_PRICE'].median())
    df['AMT_ANNUITY'] = df['AMT_ANNUITY'].fillna(df['AMT_ANNUITY'].median())

    df['ANNUITY_INCOME_RATIO'] = df['ANNUITY_INCOME_RATIO'].fillna(df['ANNUITY_INCOME_RATIO'].median())
    df['CREDIT_TERM'] = df['CREDIT_TERM'].fillna(df['CREDIT_TERM'].median())
    df['YEARS_LAST_PHONE_CHANGE'] = df['YEARS_LAST_PHONE_CHANGE'].fillna(0)
    df['CNT_CHILDREN'] = df['CNT_CHILDREN'].clip(upper=5)

    # 4. Final safety: no NaNs
    #df = df.fillna(0)
    null_cols = df.isnull().sum()
    null_cols = null_cols[null_cols > 0].sort_values(ascending=False)
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.fillna(df.median(numeric_only=True), inplace=True)

    print(null_cols)


    return df