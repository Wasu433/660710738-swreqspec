import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import SlotPicker from '../pages/SlotPicker.jsx'
import { api } from '../api/client.js'

vi.mock('../api/client.js', () => ({
  api: { getSlots: vi.fn() },
}))

test('แสดงช่วงเวลาว่างและจำนวนที่นั่งตาม FR-BKG-01', async () => {
  api.getSlots.mockClear()
  api.getSlots.mockResolvedValue({ slots: [{ id: 1, start_time: '09:00', slot_date: '2026-09-24', remaining: 2 }] })

  render(<SlotPicker />)

  expect(await screen.findByText('09:00')).toBeTruthy()
  expect(screen.getByText('เหลือ 2 ที่')).toBeTruthy()
})

test('โหลดช่วงเวลาใหม่เมื่อเปลี่ยนแพ็กเกจตาม FR-BKG-06', async () => {
  api.getSlots.mockClear()
  api.getSlots.mockResolvedValue({ slots: [] })

  render(<SlotPicker />)
  await waitFor(() => expect(api.getSlots).toHaveBeenCalledTimes(1))

  fireEvent.change(screen.getByLabelText('แพ็กเกจ'), { target: { value: 'EXECUTIVE' } })

  await waitFor(() => expect(api.getSlots).toHaveBeenCalledTimes(2))
  expect(api.getSlots.mock.calls[1][0].packageCode).toBe('EXECUTIVE')
})