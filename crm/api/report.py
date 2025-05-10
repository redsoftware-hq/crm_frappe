import frappe
from frappe.desk.query_report import run

@frappe.whitelist(allow_guest=True)
def get_report(report_name, filters=None):
    print("Fetching report data...")
    if isinstance(filters, str):
        import json
        filters = json.loads(filters)

    # Run the report
    try:
        report_output = run(report_name, filters or {})
        return {
            "columns": report_output.get("columns"),
            "data": report_output.get("result")
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error fetching report data")
        return {"error": str(e)}
