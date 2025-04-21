
import { defineStore } from 'pinia'
import { createResource } from 'frappe-ui'
import { userResource } from './user'
import router from '@/router'
import { ref, computed } from 'vue'


export const reportsStore = {
    reports: ref([]),
    report: ref(null),
  
    // Method to fetch all reports
    async fetchReports(page = 1, pageLength = 20) {
      try {
        const response = await call({
          method: 'GET',
          route: `/api/method/crm.api.get_reports`, // Adjust this API method according to your Frappe route
          params: { page, page_length: pageLength }
        })
        
        if (response && response.data) {
          this.reports.value = response.data;
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    },
  
    // Method to fetch a specific report by ID
    async fetchReportById(reportId) {
      try {
        const response = await call({
          method: 'GET',
          route: `/api/method/crm.api.get_report_by_id`,
          params: { report_id: reportId }
        })
        
        if (response && response.data) {
          this.report.value = response.data;
        }
      } catch (error) {
        console.error('Error fetching report by ID:', error);
      }
    },
  
    // Method to create a new report (if needed)
    async createReport(reportData) {
      try {
        const response = await call({
          method: 'POST',
          route: `/api/method/crm.api.create_report`,
          data: reportData
        })
  
        if (response && response.data) {
          // Optionally, update the reports list or report state after creation
          this.reports.value.push(response.data);
        }
      } catch (error) {
        console.error('Error creating report:', error);
      }
    },
  
    // Method to update an existing report
    async updateReport(reportId, reportData) {
      try {
        const response = await call({
          method: 'PUT',
          route: `/api/method/crm.api.update_report`,
          params: { report_id: reportId },
          data: reportData
        })
  
        if (response && response.data) {
          // Optionally, update the report in the store
          this.report.value = response.data;
        }
      } catch (error) {
        console.error('Error updating report:', error);
      }
    },
  
    // Method to delete a report
    async deleteReport(reportId) {
      try {
        const response = await call({
          method: 'DELETE',
          route: `/api/method/crm.api.delete_report`,
          params: { report_id: reportId }
        })
  
        if (response && response.data) {
          // Optionally, remove the report from the store after deletion
          this.reports.value = this.reports.value.filter(report => report.id !== reportId);
        }
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  }
  