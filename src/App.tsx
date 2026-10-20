import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home } from './components/Home'
import { ActivityBenefitCard } from './components/ActivityBenefitCard'
import { Practice } from './components/Practice'
import { SessionController } from './components/SessionController'
import { SessionSummary } from './components/SessionSummary'
import { StopSessionDialog } from './components/StopSessionDialog'
import { Today } from './components/Today'
import { Week } from './components/Week'
import { VoiceSettings } from './components/VoiceSettings'
import { APP_CONFIG } from './config/appConfig'
import { CHAIR_YOGA_CONFIG } from './config/chairYogaConfig'
import { useGuidedSession } from './hooks/useGuidedSession'
import { useTheme } from './hooks/useTheme'
import { buildDayBenefits } from './lib/dayBenefits'
import type { DayId } from './lib/types'
import {
  checkedCount,
  completeStep,
  isSessionComplete,
  loadProgress,
  loadRounds,
  markSessionComplete,
  saveRounds,
  saveProgress,
  toggleStep,
  type DayProgress,
} from './lib/progress'
import {
  chairYogaPlan,
  jsDayToDayId,
  localDateKey,
  planForDay,
  totalDurationSec,
} from './lib/schedule'
import { buildCategorySummaries } from './lib/sessionAnalytics'

type View = 'home' | 'practice' | 'week' | 'today'

export default function App() {
  const today = useMemo(() => jsDayToDayId(new Date().getDay()), [])
  const dateKey = useMemo(() => localDateKey(), [])
  const [view, setView] = useState<View>('home')
  const [selectedDay, setSelectedDay] = useState(today)
  const [previewDay, setPreviewDay] = useState(today)
  const [travelMode, setTravelMode] = useState<boolean>(false)

  const activeDateKey = useMemo(
    () => (travelMode ? `${dateKey}:chair` : dateKey),
    [travelMode, dateKey],
  )
  const roundsKey = travelMode ? 'chair-surya-namaskar' : 'surya-namaskar'

  const [progress, setProgress] = useState<DayProgress>(() => loadProgress(activeDateKey))
  const [rounds, setRounds] = useState(() => loadRounds(activeDateKey, roundsKey))
  const [complete, setComplete] = useState(() => isSessionComplete(activeDateKey))

  const chairSteps = useMemo(() => chairYogaPlan(), [])
  const regularSteps = useMemo(() => planForDay(selectedDay), [selectedDay])
  const practiceSteps = travelMode ? chairSteps : regularSteps
  const activeConfig = travelMode ? CHAIR_YOGA_CONFIG : APP_CONFIG

  useEffect(() => {
    setProgress(loadProgress(activeDateKey))
    setRounds(loadRounds(activeDateKey, roundsKey))
    setComplete(isSessionComplete(activeDateKey))
  }, [activeDateKey, roundsKey])

  const onGuidedStepComplete = useCallback(
    (stepId: string) => {
      setProgress(completeStep(activeDateKey, stepId))
    },
    [activeDateKey],
  )

  const guided = useGuidedSession({
    steps: practiceSteps,
    dateKey: activeDateKey,
    config: activeConfig,
    onStepComplete: onGuidedStepComplete,
  })
  const { theme, toggleTheme } = useTheme()
  const dayBenefits = useMemo(
    () => buildDayBenefits(practiceSteps, activeConfig),
    [activeConfig, practiceSteps],
  )
  const categorySummaries = useMemo(
    () =>
      buildCategorySummaries(practiceSteps, guided.state.activeElapsedByStep, activeConfig),
    [activeConfig, guided.state.activeElapsedByStep, practiceSteps],
  )

  const onToggle = useCallback(
    (stepId: string) => {
      setProgress(toggleStep(activeDateKey, stepId))
    },
    [activeDateKey],
  )

  const handleRounds = useCallback(
    (next: number) => {
      saveRounds(activeDateKey, roundsKey, next)
      setRounds(next)
      if (next >= 7) {
        const current = loadProgress(activeDateKey)
        if (!current[roundsKey]) {
          setProgress(toggleStep(activeDateKey, roundsKey))
        }
      }
    },
    [activeDateKey, roundsKey],
  )

  const onMarkDone = useCallback(() => {
    markSessionComplete(activeDateKey)
    setComplete(true)
  }, [activeDateKey])

  useEffect(() => {
    if (guided.state.status === 'completed') {
      markSessionComplete(activeDateKey)
      setComplete(true)
    }
  }, [activeDateKey, guided.state.status])

  const startGuided = useCallback(() => {
    setView('practice')
    guided.start()
  }, [guided])

  const startFromGuided = useCallback(
    (index: number) => {
      setView('practice')
      guided.startFrom(index)
    },
    [guided],
  )

  const resetGuided = useCallback(() => {
    guided.reset()
    saveProgress(activeDateKey, {})
    setProgress({})
  }, [activeDateKey, guided])

  const handleSelectDay = useCallback(
    (day: DayId) => {
      setSelectedDay(day)
      guided.reset()
    },
    [guided],
  )

  const handleToggleTravelMode = useCallback(() => {
    setTravelMode((prev) => !prev)
    guided.reset()
  }, [guided])

  let content
  if (view === 'practice') {
    content = (
      <>
        <VoiceSettings
          voices={guided.voices}
          preferences={guided.voicePreferences}
          available={guided.speechAvailable}
          onVoiceChange={guided.setVoiceURI}
          onRateChange={guided.setVoiceRate}
          onTest={guided.testVoice}
        />
        <Practice
          day={selectedDay}
          steps={practiceSteps}
          progress={progress}
          rounds={rounds}
          travelMode={travelMode}
          onToggle={onToggle}
          onRounds={handleRounds}
          onBack={() => setView('home')}
          onMarkDone={onMarkDone}
          isComplete={complete}
          guidedCurrentId={guided.currentStep?.id ?? null}
          guidedActive={guided.state.status !== 'idle'}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </>
    )
  } else if (view === 'week') {
    content = (
        <Week
          selected={previewDay}
          today={today}
          onSelect={setPreviewDay}
          onBack={() => setView('home')}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenPractice={() => {
            setSelectedDay(previewDay)
            guided.reset()
            setView('practice')
          }}
        />
    )
  } else if (view === 'today') {
    content = (
      <Today
        day={selectedDay}
        today={today}
        progress={progress}
        travelMode={travelMode}
        onBack={() => setView('home')}
        onOpenPractice={() => setView('practice')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  } else {
    content = (
      <>
        {(guided.state.status === 'saved' || guided.state.status === 'completed') && (
          <SessionSummary
            status={guided.state.status}
            elapsedMs={guided.state.totalActiveMs}
            calories={guided.calories}
            completedCount={checkedCount(
              progress,
              practiceSteps.map((step) => step.id),
            )}
            totalCount={practiceSteps.length}
            summaries={categorySummaries}
            onResume={() => {
              setView('practice')
              guided.resume()
            }}
            onStartOver={resetGuided}
          />
        )}
        <Home
        day={selectedDay}
        today={today}
        onSelectDay={handleSelectDay}
        totalSec={totalDurationSec(practiceSteps)}
        dayBenefits={dayBenefits}
        checked={checkedCount(
          progress,
          practiceSteps.map((s) => s.id),
        )}
        totalSteps={practiceSteps.length}
        practiceSteps={practiceSteps}
        guidedStatus={guided.state.status}
        guidedElapsedMs={guided.state.totalActiveMs}
        guidedCalories={guided.calories}
        travelMode={travelMode}
        onToggleTravelMode={handleToggleTravelMode}
        onStartGuided={startGuided}
        onStartFrom={startFromGuided}
        onOpenGuided={() => setView('practice')}
        onResumeGuided={() => {
          setView('practice')
          guided.resume()
        }}
        onStart={() => setView('practice')}
        onOpenToday={() => setView('today')}
        onOpenWeek={() => {
          setPreviewDay(selectedDay)
          setView('week')
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      </>
    )
  }

  const controllerVisible = ['announcing', 'running', 'paused', 'stop-confirmation'].includes(
    guided.state.status,
  )

  return (
    <>
      <main className={`app ${controllerVisible ? 'app-with-controller' : ''}`}>{content}</main>
      {controllerVisible && guided.currentStep && (
        <ActivityBenefitCard step={guided.currentStep} />
      )}
      {controllerVisible && guided.currentStep && (
        <SessionController
          activityName={guided.currentStep.name}
          activityIndex={guided.state.activityIndex}
          totalActivities={practiceSteps.length}
          remainingMs={guided.state.activityRemainingMs}
          elapsedMs={guided.state.totalActiveMs}
          calories={guided.calories}
          status={guided.state.status}
          speechAvailable={guided.speechAvailable}
          onPause={guided.pause}
          onResume={guided.resume}
          onStop={guided.requestStop}
        />
      )}
      <StopSessionDialog
        open={guided.state.status === 'stop-confirmation'}
        onSave={() => {
          guided.saveAndEnd()
          setView('home')
        }}
        onReset={() => {
          resetGuided()
          setView('home')
        }}
        onCancel={guided.cancelStop}
      />
    </>
  )
}
