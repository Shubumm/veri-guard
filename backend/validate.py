PREDICTORS = [
    'Time', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7',
    'V8', 'V9', 'V10', 'V11', 'V12', 'V13', 'V14', 'V15',
    'V16', 'V17', 'V18', 'V19', 'V20', 'V21', 'V22', 'V23',
    'V24', 'V25', 'V26', 'V27', 'V28', 'Amount'
]

def validate_input(data: dict):
    errors = []

    # Check all features are present
    missing = [f for f in PREDICTORS if f not in data]
    if missing:
        errors.append(f"Missing features: {missing}")

    # Check no null values
    nulls = [k for k, v in data.items() if v is None]
    if nulls:
        errors.append(f"Null values found in: {nulls}")

    # Check all values are numbers
    non_numeric = []
    for k, v in data.items():
        if k in PREDICTORS:
            try:
                float(v)
            except (TypeError, ValueError):
                non_numeric.append(k)
    if non_numeric:
        errors.append(f"Non-numeric values found in: {non_numeric}")

    # Check Amount is non-negative
    if 'Amount' in data and data['Amount'] is not None:
        try:
            if float(data['Amount']) < 0:
                errors.append("Amount cannot be negative")
        except (TypeError, ValueError):
            pass

    # Check Time is non-negative
    if 'Time' in data and data['Time'] is not None:
        try:
            if float(data['Time']) < 0:
                errors.append("Time cannot be negative")
        except (TypeError, ValueError):
            pass

    return errors