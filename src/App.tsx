import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home } from './components/Home'
import { ActivityBenefitCard } from './components/ActivityBenefitCard'
import { Practice } from './components/Practice'
import { SessionController } from './components/SessionController'
import { SessionSummary } from './components/SessionSummary'
import { StopSessionDialog } from './components/StopSessionDialog'
import { Week } from './components/Week'
import { VoiceSettings } from './components/VoiceSettings'
import { APP_CONFIG } from './config/appConfig'
import { useGuidedSession } from './hooks/useGuidedSession'
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
  diffVsYesterday,
  jsDayToDayId,
  localDateKey,
  planForDay,
  totalDurationSec,
} from './lib/schedule'
import { buildCategorySummaries } from './lib/sessionAnalytics'

type View = 'home' | 'practice' | 'week'

export default function App() {
  const today = useMemo(() => jsDayToDayId(new Date().getDay()), [])
  const dateKey = useMemo(() => localDateKey(), [])
  const [view, setView] = useState<View>('home')
  const [previewDay, setPreviewDay] = useState(today)
  const [progress, setProgress] = useState<DayProgress>(() => loadProgress(dateKey))
  const [rounds, setRounds] = useState(() => loadRounds(dateKey, 'surya-namaskar'))
  const [complete, setComplete] = useState(() => isSessionComplete(dateKey))

  const practiceSteps = useMemo(() => planForDay(today), [today])
  const diffs = useMemo(() => diffVsYesterday(today), [today])

  const onGuidedStepComplete = useCallback(
    (stepId: string) => {
      setProgress(completeStep(dateKey, stepId))
    },
    [dateKey],
  )

  const guided = useGuidedSession({
    steps: practiceSteps,
    dateKey,
    onStepComplete: onGuidedStepComplete,
  })
  const categorySummaries = useMemo(
    () =>
      buildCategorySummaries(practiceSteps, guided.state.activeElapsedByStep, APP_CONFIG),
    [guided.state.activeElapsedByStep, practiceSteps],
  )

  const onToggle = useCallback(
    (stepId: string) => {
      setProgress(toggleStep(dateKey, stepId))
    },
    [dateKey],
  )

  const handleRounds = useCallback(
    (next: number) => {
      saveRounds(dateKey, 'surya-namaskar', next)
      setRounds(next)
      if (next >= 7) {
        const current = loadProgress(dateKey)
        if (!current['surya-namaskar']) {
          setProgress(toggleStep(dateKey, 'surya-namaskar'))
        }
      }
    },
    [dateKey],
  )

  const onMarkDone = useCallback(() => {
    markSessionComplete(dateKey)
    setComplete(true)
  }, [dateKey])

  useEffect(() => {
    if (guided.state.status === 'completed') {
      markSessionComplete(dateKey)
      setComplete(true)
    }
  }, [dateKey, guided.state.status])

  const startGuided = useCallback(() => {
    setView('practice')
    guided.start()
  }, [guided])

  const resetGuided = useCallback(() => {
    guided.reset()
    saveProgress(dateKey, {})
    setProgress({})
  }, [dateKey, guided])

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
          day={today}
          steps={practiceSteps}
          progress={progress}
          rounds={rounds}
          onToggle={onToggle}
          onRounds={handleRounds}
          onBack={() => setView('home')}
          onMarkDone={onMarkDone}
          isComplete={complete}
          guidedCurrentId={guided.currentStep?.id ?? null}
          guidedActive={guided.state.status !== 'idle'}
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
          onOpenPractice={() => setView('practice')}
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
        day={today}
        totalSec={totalDurationSec(practiceSteps)}
        diffs={diffs}
        checked={checkedCount(
          progress,
          practiceSteps.map((s) => s.id),
        )}
        totalSteps={practiceSteps.length}
        guidedStatus={guided.state.status}
        guidedElapsedMs={guided.state.totalActiveMs}
        guidedCalories={guided.calories}
        onStartGuided={startGuided}
        onOpenGuided={() => setView('practice')}
        onResumeGuided={() => {
          setView('practice')
          guided.resume()
        }}
        onStart={() => setView('practice')}
        onOpenWeek={() => {
          setPreviewDay(today)
          setView('week')
        }}
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
