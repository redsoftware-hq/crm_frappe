
import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_fcrm_reports():
    """Fetch all standard and custom reports for FCRM module (Redsoft CRM)."""
    reports = frappe.get_all(
        "Report",
        filters={"module": "Redsoft CRM"},
        fields=["name", "ref_doctype", "report_type", "is_standard", "modified"]
    )

    return {
        "status": "success",
        "module": "Redsoft CRM",
        "count": len(reports),
        "data": reports
    }
