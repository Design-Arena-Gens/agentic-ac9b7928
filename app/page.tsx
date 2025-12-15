'use client'

import { useState } from 'react'

type RoomStatus = {
  status: string
  occupancy?: number
}

type RoomData = Record<string, RoomStatus>

const ROOMS = [
  '101', '102', '103', '104', '105', '106', '107', '108', '109',
  '201', '202', '203', '204', '205', '206', '207', '208', '209',
  '301', '302', '303', '304', '305', '306', '307', '308', '309'
]

const STATUS_OPTIONS = [
  { value: 'occ', label: 'Occupied (OCC)', needsOccupancy: true },
  { value: 'VC', label: 'Vacant Clean (VC)', needsOccupancy: false },
  { value: 'VD', label: 'Vacant Dirty (VD)', needsOccupancy: false },
  { value: 'DND', label: 'Do Not Disturb (DND)', needsOccupancy: false },
  { value: 'S/O', label: 'Sleep Out (S/O)', needsOccupancy: false },
]

export default function Home() {
  const [date, setDate] = useState(() => {
    const today = new Date()
    const month = today.toLocaleString('en-US', { month: 'short' })
    const day = today.getDate()
    const year = today.getFullYear()
    return `${month}. ${day}, ${year}`
  })
  const [attendant, setAttendant] = useState('')
  const [rooms, setRooms] = useState<RoomData>({})
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [tempStatus, setTempStatus] = useState<string>('')
  const [tempOccupancy, setTempOccupancy] = useState<string>('')
  const [extras, setExtras] = useState<Array<{ type: string; room: string }>>([])
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const openRoomModal = (room: string) => {
    setSelectedRoom(room)
    const current = rooms[room]
    if (current) {
      setTempStatus(current.status)
      setTempOccupancy(current.occupancy?.toString() || '')
    } else {
      setTempStatus('')
      setTempOccupancy('')
    }
  }

  const saveRoomStatus = () => {
    if (!selectedRoom || !tempStatus) return

    const statusOption = STATUS_OPTIONS.find(opt => opt.value === tempStatus)
    const newRooms = { ...rooms }

    if (statusOption?.needsOccupancy && tempOccupancy) {
      newRooms[selectedRoom] = { status: tempStatus, occupancy: parseInt(tempOccupancy) }
    } else {
      newRooms[selectedRoom] = { status: tempStatus }
    }

    setRooms(newRooms)
    setSelectedRoom(null)
    setTempStatus('')
    setTempOccupancy('')
  }

  const generateReport = () => {
    let report = `Occupancy - Morning\nDate: ${date}\nAttendant: ${attendant}\n`

    ROOMS.forEach(room => {
      const roomData = rooms[room]
      if (roomData) {
        const statusText = roomData.occupancy
          ? `${roomData.status} ${roomData.occupancy}`
          : roomData.status
        report += `${room}- ${statusText}\n`
      } else {
        report += `${room}- \n`
      }
    })

    if (extras.length > 0) {
      extras.forEach(extra => {
        if (extra.type && extra.room) {
          report += `${extra.type}: ${extra.room}\n`
        }
      })
    }

    setOutput(report)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const encodedText = encodeURIComponent(output)
    window.open(`https://wa.me/?text=${encodedText}`, '_blank')
  }

  const addExtra = () => {
    setExtras([...extras, { type: '', room: '' }])
  }

  const updateExtra = (index: number, field: 'type' | 'room', value: string) => {
    const newExtras = [...extras]
    newExtras[index][field] = value
    setExtras(newExtras)
  }

  const getRoomDisplayText = (room: string) => {
    const roomData = rooms[room]
    if (!roomData) return 'Tap to set'
    return roomData.occupancy
      ? `${roomData.status} ${roomData.occupancy}`
      : roomData.status
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🏨 Hotel Occupancy Tracker</h1>
        <p>Quick & Easy Digital Discrepancy Report</p>
      </div>

      <div className="form-section">
        <div className="input-group">
          <label>Date</label>
          <input
            type="text"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Dec. 14, 2025"
          />
        </div>

        <div className="input-group">
          <label>Attendant Name</label>
          <input
            type="text"
            value={attendant}
            onChange={(e) => setAttendant(e.target.value)}
            placeholder="Enter attendant name"
          />
        </div>

        <div className="input-group">
          <label>Room Status (Tap to set)</label>
          <div className="rooms-grid">
            {ROOMS.map(room => (
              <div
                key={room}
                className={`room-card ${rooms[room] ? 'filled' : ''}`}
                onClick={() => openRoomModal(room)}
              >
                <div className="room-number">{room}</div>
                <div className="room-status">{getRoomDisplayText(room)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="extras-section">
          <h3>Extras (Baby Cot, Extra Bed, etc.)</h3>
          {extras.map((extra, index) => (
            <div key={index} className="extra-item">
              <input
                type="text"
                placeholder="Type"
                value={extra.type}
                onChange={(e) => updateExtra(index, 'type', e.target.value)}
              />
              <input
                type="text"
                placeholder="Room Number"
                value={extra.room}
                onChange={(e) => updateExtra(index, 'room', e.target.value)}
              />
            </div>
          ))}
          <button className="add-extra-btn" onClick={addExtra}>
            + Add Extra Item
          </button>
        </div>

        <button className="generate-btn" onClick={generateReport}>
          Generate Report
        </button>
      </div>

      {output && (
        <div className="output-section">
          <h2>📋 Your Report</h2>
          <div className="output-text">{output}</div>
          <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={copyToClipboard}
          >
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </button>
          <div className="share-buttons">
            <button className="whatsapp-btn" onClick={shareViaWhatsApp}>
              📱 Share WhatsApp
            </button>
            <button className="copy-btn" onClick={copyToClipboard}>
              📋 Copy Text
            </button>
          </div>
        </div>
      )}

      {selectedRoom && (
        <div className="status-modal" onClick={() => setSelectedRoom(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Room {selectedRoom}</div>

            <div className="status-options">
              {STATUS_OPTIONS.map(option => (
                <button
                  key={option.value}
                  className={`status-btn ${tempStatus === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    setTempStatus(option.value)
                    if (!option.needsOccupancy) {
                      setTempOccupancy('')
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {tempStatus === 'occ' && (
              <div className="occupancy-input">
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Number of guests"
                  value={tempOccupancy}
                  onChange={(e) => setTempOccupancy(e.target.value)}
                />
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedRoom(null)}>
                Cancel
              </button>
              <button className="btn-save" onClick={saveRoomStatus}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
