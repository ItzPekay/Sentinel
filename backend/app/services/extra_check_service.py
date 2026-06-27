def parse_blood_glucose(glucose: float) -> dict:
    if glucose < 20:
        return {
            "message": (
                "CRITICAL: Glucose < 20 mg/dL -- life-threatening neuroglycopenia. "
                "Patient is at immediate risk of seizure, loss of consciousness, or coma. "
                "Any neurological symptoms (weakness, slurred speech, confusion) are almost certainly "
                "hypoglycemia-induced rather than a true stroke. Administer IV dextrose or glucagon NOW."
            ),
            "emergency_services": True,
            "contact_family": True,
        }

    elif glucose < 40:
        return {
            "message": (
                "SEVERE HYPOGLYCEMIA: Glucose 20-39 mg/dL -- high-confidence stroke mimic. "
                "Focal neurological deficits (facial droop, arm weakness, speech difficulty) at this glucose level "
                "are predominantly hypoglycemic in origin. Aggressive correction required immediately; "
                "do NOT delay treatment awaiting imaging."
            ),
            "emergency_services": True,
            "contact_family": True,
        }

    elif glucose < 55:
        return {
            "message": (
                "MODERATE HYPOGLYCEMIA: Glucose 40-54 mg/dL -- stroke mimic likely. "
                "Confusion, slurred speech, unilateral weakness, and altered consciousness are commonly caused "
                "by glucose at this level. Oral glucose (if conscious and able to swallow) or IV/IM intervention "
                "recommended. Monitor for rapid symptom resolution after correction."
            ),
            "emergency_services": True,
            "contact_family": True,
        }

    elif glucose < 70:
        return {
            "message": (
                "MILD HYPOGLYCEMIA: Glucose 55-69 mg/dL -- stroke mimic possible. "
                "Subtle symptoms such as mild confusion, hand tremor, or word-finding difficulty may be glucose-driven. "
                "Administer fast-acting carbohydrates and recheck in 15 minutes. "
                "If symptoms persist after correction, escalate to stroke protocol."
            ),
            "emergency_services": False,
            "contact_family": True,
        }

    elif glucose <= 99:
        return {
            "message": (
                "NORMAL FASTING GLUCOSE: Glucose 70-99 mg/dL -- hypoglycemia is not the cause. "
                "Neurological symptoms are not attributable to blood sugar at this level. "
                "Stroke, TIA, or another neurological etiology should be the primary concern. "
                "Proceed with standard stroke assessment (FAST criteria, imaging)."
            ),
            "emergency_services": False,
            "contact_family": False,
        }

    elif glucose <= 125:
        return {
            "message": (
                "PRE-DIABETIC RANGE: Glucose 100-125 mg/dL -- mildly elevated, not acutely dangerous. "
                "Blood sugar is unlikely to be causing current symptoms. "
                "Neurological symptoms more likely represent a primary neurological event. "
                "Flag glucose for follow-up; focus evaluation on stroke or TIA."
            ),
            "emergency_services": False,
            "contact_family": False,
        }

    elif glucose <= 179:
        return {
            "message": (
                "DIABETIC RANGE: Glucose 126-179 mg/dL -- elevated but unlikely to cause acute neuro symptoms alone. "
                "In a known diabetic, consider whether insulin was recently taken (risk of subsequent hypoglycemia). "
                "Neurological symptoms at this level should still trigger stroke evaluation. "
                "Monitor glucose trend; hyperglycemia worsens outcomes in true stroke and limits tPA eligibility."
            ),
            "emergency_services": False,
            "contact_family": True,
        }

    elif glucose <= 249:
        return {
            "message": (
                "SIGNIFICANT HYPERGLYCEMIA: Glucose 180-249 mg/dL -- hyperosmolar state developing. "
                "Headache, blurred vision, fatigue, and mild confusion can occur. "
                "If patient has type 1 diabetes, assess for DKA. "
                "Hyperglycemia at this level worsens infarct size in true stroke -- "
                "report to emergency team regardless of primary diagnosis."
            ),
            "emergency_services": True,
            "contact_family": True,
        }

    elif glucose <= 399:
        return {
            "message": (
                "SEVERE HYPERGLYCEMIA: Glucose 250-399 mg/dL -- DKA or HHS territory. "
                "Neurological symptoms (altered mental status, focal weakness) may be driven by hyperosmolarity "
                "rather than vascular occlusion. Urgent IV fluid resuscitation and insulin required. "
                "Differentiate stroke from hyperglycemic crisis with imaging and metabolic panel."
            ),
            "emergency_services": True,
            "contact_family": True,
        }

    else:
        return {
            "message": (
                "CRITICAL HYPERGLYCEMIA: Glucose >= 400 mg/dL -- hyperosmolar hyperglycemic state (HHS) or severe DKA. "
                "Coma, seizures, and focal neurological deficits are expected at this level and may be entirely "
                "metabolic rather than ischemic in origin. Do not assume stroke without ruling out HHS/DKA first. "
                "Immediate IV access, aggressive fluid resuscitation, and insulin drip required."
            ),
            "emergency_services": True,
            "contact_family": True,
        }
