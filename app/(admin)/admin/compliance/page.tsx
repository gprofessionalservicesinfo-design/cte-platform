import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComplianceCalendar } from '@/components/admin/compliance-calendar'
import { CalendarCheck } from 'lucide-react'

export default function AdminCompliancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
        <p className="text-gray-500 mt-1 text-sm">Track annual reports, renewals, and deadlines across all companies.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-gray-500" />
            All Compliance Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ComplianceCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
