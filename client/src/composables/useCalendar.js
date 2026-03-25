import { ref, computed } from 'vue'

export function useCalendar() {
  const currentDate = ref(new Date())
  const currentView = ref('month')

  const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  const DAYS_SHORT = ['Lun','Mar','Mie','Jue','Vie','Sab','Dom']
  const DAYS_LONG = ['Domingo','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado']

  function formatDateKey(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  function todayKey() {
    return formatDateKey(new Date())
  }

  // Monday-first week start
  function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay() // 0=Sun
    const diff = (day + 6) % 7 // Monday=0
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  function goToday() {
    currentDate.value = new Date()
  }

  function goPrev() {
    const d = new Date(currentDate.value)
    if (currentView.value === 'month') d.setMonth(d.getMonth() - 1)
    else if (currentView.value === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    currentDate.value = d
  }

  function goNext() {
    const d = new Date(currentDate.value)
    if (currentView.value === 'month') d.setMonth(d.getMonth() + 1)
    else if (currentView.value === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    currentDate.value = d
  }

  const headerTitle = computed(() => {
    const d = currentDate.value
    if (currentView.value === 'month') {
      return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
    }
    if (currentView.value === 'week') {
      const start = getWeekStart(d)
      const end = new Date(start)
      end.setDate(end.getDate() + 6)
      const sMonth = MONTHS[start.getMonth()].slice(0, 3)
      const eMonth = MONTHS[end.getMonth()].slice(0, 3)
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${eMonth} ${end.getFullYear()}`
      }
      return `${start.getDate()} ${sMonth} - ${end.getDate()} ${eMonth} ${end.getFullYear()}`
    }
    // day
    return `${DAYS_LONG[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  })

  function getMonthGrid(date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // Monday-first offset
    const gridStart = new Date(firstDay)
    gridStart.setDate(gridStart.getDate() - startOffset)

    const today = todayKey()
    const cells = []
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(gridStart)
      cellDate.setDate(gridStart.getDate() + i)
      const dateKey = formatDateKey(cellDate)
      cells.push({
        date: cellDate,
        dateKey,
        dayNumber: cellDate.getDate(),
        isCurrentMonth: cellDate.getMonth() === month,
        isToday: dateKey === today
      })
    }
    return cells
  }

  function getWeekDays(date) {
    const start = getWeekStart(date)
    const today = todayKey()
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      const dateKey = formatDateKey(d)
      return {
        date: d,
        dateKey,
        dayName: DAYS_SHORT[i],
        dayNumber: d.getDate(),
        monthShort: MONTHS[d.getMonth()].slice(0, 3),
        isToday: dateKey === today
      }
    })
  }

  function getHourSlots(startHour = 6, endHour = 22) {
    return Array.from({ length: endHour - startHour + 1 }, (_, i) => {
      const hour = startHour + i
      return { hour, label: `${String(hour).padStart(2, '0')}:00` }
    })
  }

  function buildAppointmentsByDate(appointments) {
    const map = new Map()
    for (const a of appointments) {
      if (!map.has(a.date)) map.set(a.date, [])
      map.get(a.date).push(a)
    }
    // Sort each day's appointments by time
    for (const [, list] of map) {
      list.sort((a, b) => a.time.localeCompare(b.time))
    }
    return map
  }

  return {
    currentDate,
    currentView,
    headerTitle,
    goToday,
    goPrev,
    goNext,
    formatDateKey,
    todayKey,
    getWeekStart,
    getMonthGrid,
    getWeekDays,
    getHourSlots,
    buildAppointmentsByDate,
    DAYS_SHORT,
    MONTHS
  }
}
