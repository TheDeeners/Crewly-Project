import { useState } from 'react'
import { Holiday, LeaveRequest, AttendanceRecord } from '../types'
import { IconChevronLeft, IconChevronRight, IconCalendar } from './Icons'

interface CalendarWidgetProps {
  holidays: Holiday[]
  leaveRequests?: LeaveRequest[]
  attendances?: AttendanceRecord[]
}

export function CalendarWidget({
  holidays = [],
  leaveRequests = [],
  attendances = [],
}: CalendarWidgetProps) {
  // Current viewing month
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(() => {
    return new Date().toISOString().slice(0, 10)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth() // 0 - 11

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(year, month, 1).getDay()
  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate()

  // Format month and Thai Buddhist year for header
  const monthTitle = viewDate.toLocaleDateString('th-TH', {
    month: 'long',
    year: 'numeric',
  })

  const todayStr = new Date().toISOString().slice(0, 10)

  // Navigation handlers
  function handlePrevMonth() {
    setViewDate(new Date(year, month - 1, 1))
  }

  function handleNextMonth() {
    setViewDate(new Date(year, month + 1, 1))
  }

  function handleToday() {
    const now = new Date()
    setViewDate(now)
    setSelectedDateStr(now.toISOString().slice(0, 10))
  }

  // Days of week header
  const weekDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']

  // Find info for selected date
  const selectedHoliday = holidays.find((h) => h.holidayDate === selectedDateStr)
  const selectedLeave = leaveRequests.find(
    (l) =>
      l.status === 'APPROVED' &&
      selectedDateStr &&
      selectedDateStr >= l.startDate &&
      selectedDateStr <= l.endDate
  )
  const selectedAtt = attendances.find((a) => a.workDate === selectedDateStr)

  return (
    <div className="bg-surface rounded-2xl border border-border p-4 sm:p-5 shadow-card flex flex-col justify-between">
      <div>
        {/* Calendar Header with Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <IconCalendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-txt">ตารางงานและวันหยุด</h2>
              <p className="text-xs text-txt-muted">ปฏิทินวันทำงาน วันหยุดบริษัท และประวัติการลา</p>
            </div>
          </div>

          {/* Month selector & Today button */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-bg border border-border hover:bg-bg-subtle text-txt transition-colors"
            >
              วันนี้
            </button>
            <div className="flex items-center bg-bg rounded-lg border border-border p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded-md text-txt-muted hover:text-txt hover:bg-surface transition-colors"
                title="เดือนก่อนหน้า"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-bold text-primary min-w-[120px] text-center">
                {monthTitle}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded-md text-txt-muted hover:text-txt hover:bg-surface transition-colors"
                title="เดือนถัดไป"
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="w-full">
          {/* Day of Week Header */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1 text-center">
            {weekDays.map((d, i) => (
              <div
                key={i}
                className={`text-[11px] font-semibold py-1 ${
                  i === 0 ? 'text-status-rejected' : i === 6 ? 'text-txt-muted' : 'text-txt'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[56px] sm:min-h-[64px] rounded-xl bg-bg/30 border border-transparent" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1
              const dayOfWeek = (firstDayIndex + i) % 7
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isToday = dateStr === todayStr
              const isSelected = dateStr === selectedDateStr

              // Check if holiday
              const holiday = holidays.find((h) => h.holidayDate === dateStr)
              // Check if approved leave
              const leave = leaveRequests.find(
                (l) => l.status === 'APPROVED' && dateStr >= l.startDate && dateStr <= l.endDate
              )
              // Check if attended
              const att = attendances.find((a) => a.workDate === dateStr)

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[56px] sm:min-h-[64px] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all duration-150 ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary-light/40'
                      : isToday
                      ? 'border-primary/60 bg-primary-light/20'
                      : isWeekend
                      ? 'border-border/60 bg-bg/50 hover:border-border'
                      : 'border-border/70 bg-surface hover:border-primary/40 hover:bg-bg/40'
                  }`}
                >
                  {/* Top row: day number & today pill */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[11px]'
                          : dayOfWeek === 0
                          ? 'text-status-rejected font-medium'
                          : 'text-txt'
                      }`}
                    >
                      {day}
                    </span>
                    {holiday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-status-rejected shrink-0" title={holiday.name} />
                    )}
                  </div>

                  {/* Badges / indicators inside cell */}
                  <div className="space-y-0.5 w-full mt-1">
                    {holiday && (
                      <span
                        className="block text-[9px] px-1 py-0.5 rounded bg-status-rejected-bg text-status-rejected font-semibold truncate border border-status-rejected-border leading-tight"
                        title={holiday.name}
                      >
                        {holiday.name}
                      </span>
                    )}

                    {!holiday && leave && (
                      <span
                        className="block text-[9px] px-1 py-0.5 rounded bg-status-pending-bg text-status-pending font-semibold truncate border border-status-pending-border leading-tight"
                        title={`${leave.leaveType?.name || 'การลา'}`}
                      >
                        {leave.leaveType?.name || 'ลา'}
                      </span>
                    )}

                    {!holiday && !leave && att && (
                      <span className="block text-[9px] px-1 py-0.5 rounded bg-status-success-bg text-status-success font-medium truncate leading-tight">
                        {att.checkOutAt ? 'ครบเวลา' : 'เข้างาน'}
                      </span>
                    )}

                    {!holiday && !leave && !att && isWeekend && (
                      <span className="block text-[9px] text-txt-light/70 truncate text-center">
                        หยุด
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Info & Legend Footer */}
      <div className="mt-4 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Selected date preview */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-txt-muted text-[11px]">วันที่เลือก ({selectedDateStr}):</span>
          {selectedHoliday ? (
            <span className="font-semibold text-status-rejected truncate">
              {selectedHoliday.name} (วันหยุดบริษัท)
            </span>
          ) : selectedLeave ? (
            <span className="font-semibold text-status-pending truncate">
              อนุมัติลา: {selectedLeave.leaveType?.name} ({selectedLeave.totalDays} วัน)
            </span>
          ) : selectedAtt ? (
            <span className="font-semibold text-status-success truncate">
              ปฏิบัติงาน (เข้า: {selectedAtt.checkInAt ? new Date(selectedAtt.checkInAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : '-'} น.)
            </span>
          ) : (
            <span className="text-txt-muted">วันปกติ</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-txt-muted shrink-0">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-success" />
            <span>เข้างาน</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-rejected" />
            <span>วันหยุดบริษัท</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-status-pending" />
            <span>วันลา</span>
          </div>
        </div>
      </div>
    </div>
  )
}
