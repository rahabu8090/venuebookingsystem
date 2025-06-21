const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface TimetableImportResponse {
  success: boolean
  message: string
  data: {
    processed_entries: number
    updated_venues: number
    total_weeks: number
    errors: string[]
  }
}

export interface TimetableImportRequest {
  file: File
  start_date: string
  end_date: string
  file_type: "excel" | "csv"
}

class TimetableService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token')
    return {
      'Authorization': `Bearer ${token}`,
    }
  }

  async importTimetable(data: TimetableImportRequest): Promise<TimetableImportResponse> {
    const formData = new FormData()
    formData.append('file', data.file)
    formData.append('start_date', data.start_date)
    formData.append('end_date', data.end_date)
    formData.append('file_type', data.file_type)

    const response = await fetch(`${API_BASE_URL}/admin/timetable/import`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to import timetable')
    }

    return response.json()
  }

  async downloadTemplate(format: "excel" | "csv"): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/admin/timetable/template?format=${format}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error('Failed to download template')
    }

    return response.blob()
  }
}

export const timetableService = new TimetableService() 