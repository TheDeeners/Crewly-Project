import React from 'react'
import { AttendanceRecord } from '../types'
import { Button } from './Button'
import { IconClock, IconCheck, IconX } from './Icons'

interface AttendanceModalProps {
  isOpen: boolean
  onClose: () => void
  todayAttendance: AttendanceRecord | null
  onCheckIn: () => Promise<void> | void
  onCheckOut: () => Promise<void> | void
  actionLoading?: boolean
  currentTime: string
  todayDateThai: string
  formatTime: (isoString: string | null) => string
  modalMessage?: { text: string; type: 'success' | 'error' } | null
}

export function AttendanceModal({
  isOpen,
  onClose,
  todayAttendance,
  onCheckIn,
  onCheckOut,
  actionLoading = false,
  currentTime,
  todayDateThai,
  formatTime,
  modalMessage,
}: AttendanceModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-txt/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative bg-surface rounded-2xl border border-border shadow-float max-w-md w-full p-5 sm:p-6 space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-light text-primary flex items-center justify-center">
              <IconClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-txt leading-snug">บันทึกเวลาทำงาน</h2>
              <p className="text-xs text-txt-muted">ลงเวลาเข้า-ออกงานประจำวัน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-txt-muted hover:text-txt p-1.5 rounded-xl hover:bg-bg transition-colors"
            aria-label="ปิด"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* In-Modal Alert Message */}
        {modalMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold border ${
              modalMessage.type === 'success'
                ? 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]'
                : 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]'
            }`}
          >
            {modalMessage.text}
          </div>
        )}

        {/* Live Clock Display in Modal */}
        <div className="p-5 rounded-2xl bg-bg border border-border text-center space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-txt-muted mb-1">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse inline-block" />
            <span>เวลาปัจจุบันตามเซิร์ฟเวอร์</span>
          </div>
          <div className="font-mono text-3xl font-extrabold text-primary tracking-tight">
            {currentTime || '--:--:--'}
          </div>
          <p className="text-xs text-txt-muted mt-1">{todayDateThai}</p>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-surface border border-border">
            <span className="text-[11px] text-txt-muted block mb-1">เวลาเข้างาน</span>
            <span className="text-sm font-bold text-txt block">
              {todayAttendance?.checkInAt ? formatTime(todayAttendance.checkInAt) : '-'}
            </span>
            <div className="mt-1">
              {todayAttendance ? (
                <span className="text-[10px] font-semibold text-status-success">เช็คอินแล้ว</span>
              ) : (
                <span className="text-[10px] text-txt-muted">ยังไม่เช็คอิน</span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-border">
            <span className="text-[11px] text-txt-muted block mb-1">เวลาออกงาน</span>
            <span className="text-sm font-bold text-txt block">
              {todayAttendance?.checkOutAt ? formatTime(todayAttendance.checkOutAt) : '-'}
            </span>
            <div className="mt-1">
              {todayAttendance?.checkOutAt ? (
                <span className="text-[10px] font-semibold text-status-info">เช็คเอาต์แล้ว</span>
              ) : (
                <span className="text-[10px] text-txt-muted">ยังไม่เช็คเอาต์</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons inside Modal */}
        <div className="space-y-3 pt-2">
          {!todayAttendance && (
            <Button
              variant="primary"
              size="lg"
              onClick={onCheckIn}
              isLoading={actionLoading}
              className="w-full shadow-card"
              leftIcon={<IconCheck className="w-5 h-5" />}
            >
              ยืนยันบันทึกเวลาเข้างาน (Check-in)
            </Button>
          )}

          {todayAttendance && !todayAttendance.checkOutAt && (
            <Button
              variant="secondary"
              size="lg"
              onClick={onCheckOut}
              isLoading={actionLoading}
              className="w-full shadow-card"
              leftIcon={<IconClock className="w-5 h-5" />}
            >
              ยืนยันบันทึกเวลาออกงาน (Check-out)
            </Button>
          )}

          {todayAttendance?.checkOutAt && (
            <div className="p-3 bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl text-center text-xs font-semibold text-[#15803D]">
              ✓ คุณได้ลงเวลาเข้าและออกงานวันนี้ครบถ้วนแล้ว
            </div>
          )}

          <Button
            variant="outline"
            size="md"
            onClick={onClose}
            className="w-full"
          >
            ปิดหน้าต่าง
          </Button>
        </div>
      </div>
    </div>
  )
}
