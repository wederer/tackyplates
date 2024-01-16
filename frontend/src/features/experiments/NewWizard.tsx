import {
  Box,
  Container,
  Grid,
  InputAdornment,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import LoadingButton from '@mui/lab/LoadingButton';
import { ExperimentIn, SettingOut, useTackyplatesUrlsCreateExperimentMutation, } from '../../app/experimentsApi'
import { useNavigate } from 'react-router-dom'
import Button from '@mui/material/Button'
import { QueryStatus } from "@reduxjs/toolkit/query";
import { clientLog } from '../../app/logging';

enum TimesMode {
  EVERY_X = 'everyX',
  DISTRIBUTED = 'distributed',
  MANUAL = 'manual',
}

function NewWizard(props: { settings: SettingOut }) {
  const settings = props.settings;
  const initialState = {
    numberOfMeasurements: 5,
    manualTimes: ['0', '15', '30', '45', '60'],
    actualTimes: [0, 15, 30, 45, 60],
    distributed: '60',
    everyX: '15'
  }

  const [experiments, setExperiments] = useState<ExperimentIn[]>([])
  const [projectId, setProjectId] = useState<string>('')
  const [projectIdError, setProjectIdError] = useState<string>('')
  const [sampleId, setSampleId] = useState<string>('')
  const [sampleIdError, setSampleIdError] = useState<string>('')
  const [comment, setComment] = useState<string>('')
  const [numberOfMeasurements, setNumberOfMeasurements] = useState<number>(initialState.numberOfMeasurements)
  const [maximumNumberOfMeasurements, setMaximumNumberOfMeasurements] = useState(getMaxMeasurements(settings, experiments))

  const [timesMode, setTimesMode] = useState<TimesMode>(TimesMode.EVERY_X)
  const [everyX, setEveryX] = useState<string>(initialState.everyX)
  const [distributed, setDistributed] = useState<string>(initialState.distributed)
  const [manualTimes, setManualTimes] = useState<Array<string>>(initialState.manualTimes)
  const [actualTimes, setActualTimes] = useState<Array<number>>(initialState.actualTimes)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const [createExperiments, {
    status: createStatus,
    isLoading: createLoading
  }] = useTackyplatesUrlsCreateExperimentMutation()

  function roundToTwo(num: number) {
    return +(Math.round(Number(num + "e+2")) + "e-2");
  }

  useEffect(() => {
    const newMax = getMaxMeasurements(settings, experiments)
    clientLog('settings.board_width, setting.ball_diameter, settings.measurement_gap', settings.board_width, settings.ball_diameter, settings.measurement_gap)
    clientLog('settings.board_width - sumOfWidths(experiments)', settings.board_width - sumOfWidths(experiments))
    clientLog('settings.ball_diameter + 2 * settings.measurement_gap', settings.ball_diameter + 2 * settings.measurement_gap)
    clientLog('newMax', newMax)
    setMaximumNumberOfMeasurements(newMax)
  }, [settings, experiments])

  useEffect(() => {
    if (numberOfMeasurements > maximumNumberOfMeasurements) {
      setNumberOfMeasurements(maximumNumberOfMeasurements)
    }
  }, [maximumNumberOfMeasurements])

  // useEffect(() => {
  //   switch (timesMode) {
  //     case TimesMode.EVERY_X: {
  //       if (everyX === '' || isNaN(Number.parseFloat(everyX))) return
  //       const times = Array.from(Array(numberOfMeasurements).keys()).map((_, index) => {
  //         return index * Number.parseFloat(everyX)
  //       })
  //       setActualTimes(times)
  //       break;
  //     }
  //     case TimesMode.DISTRIBUTED: {
  //       const distributedNumber = Number.parseFloat(distributed)
  //       if (distributed === '' || isNaN(distributedNumber)) return
  //       const wait = distributedNumber / (numberOfMeasurements - 1)
  //       if (numberOfMeasurements === 1) {
  //         setActualTimes([0])
  //         break;
  //       } else if (numberOfMeasurements === 2) {
  //         setActualTimes([0, distributedNumber])
  //         break;
  //       }
  //       const times = Array.from(Array(numberOfMeasurements - 2).keys()).map((_, index) => {
  //         return roundToTwo(wait * (index + 1))
  //       })
  //       setActualTimes([0, ...times, distributedNumber])
  //       break;
  //     }
  //     case TimesMode.MANUAL: {
  //       const newTimesNumber = manualTimes.map(el => parseFloat(el))
  //       if(manualTimes.some(el => el === '') || newTimesNumber.some(el => isNaN(el))) return
  //       newTimesNumber.splice(numberOfMeasurements, 1)
  //       setActualTimes(newTimesNumber)
  //       break;
  //     }
  //   }
  // }, [everyX, distributed, manualTimes, timesMode, numberOfMeasurements])

  useEffect(() => {
    clientLog('new actual Times', actualTimes)
    // TODO how to set manualtimes without causing endless rendering?
    // setManualTimes(actualTimes.map(el => `${el}`))
  }, [actualTimes])

  useEffect(() => {
    if (timesMode !== TimesMode.EVERY_X) return
    if (everyX === '' || isNaN(Number.parseFloat(everyX))) return
    const times = Array.from(Array(numberOfMeasurements).keys()).map((_, index) => {
      return index * Number.parseFloat(everyX)
    })
    setActualTimes(times)
  }, [everyX, timesMode, numberOfMeasurements])

  useEffect(() => {
    if (timesMode !== TimesMode.DISTRIBUTED) return
    const distributedNumber = Number.parseFloat(distributed)
    if (distributed === '' || isNaN(distributedNumber)) return

    if (numberOfMeasurements === 1) {
      setActualTimes([0])
      return
    } else if (numberOfMeasurements === 2) {
      setActualTimes([0, distributedNumber])
      return
    }

    const wait = distributedNumber / (numberOfMeasurements - 1)
    if (numberOfMeasurements === 1) {
      setActualTimes([0])
    } else {
      const times = Array.from(Array(numberOfMeasurements - 2).keys()).map((_, index) => {
        return roundToTwo(wait * (index + 1))
      })
      setActualTimes([0, ...times, distributedNumber])
    }
  }, [distributed, timesMode, numberOfMeasurements])

  // useEffect(() => {
  //   if(timesMode !== TimesMode.MANUAL) return
  //   const newTimesNumber = manualTimes.map(el => parseFloat(el))
  //   if (manualTimes.some(el => el === '') || newTimesNumber.some(el => isNaN(el))) return

  //   newTimesNumber.splice(numberOfMeasurements, 1)
  //   setActualTimes(newTimesNumber)
  // }, [manualTimes, timesMode, numberOfMeasurements])

  const navigate = useNavigate();

  const handleFinish = () => {
    handleAddAnother(true)()
  };

  useEffect(() => {
    clientLog('createStatus change', createStatus)
    if (createStatus === QueryStatus.fulfilled) {
      navigate('/running')
    }
  }, [createStatus])

  const formValid = (): boolean => {
    if (!errors || Object.keys(errors).length !== 0 || Object.getPrototypeOf(errors) !== Object.prototype) {
      return false
    }
    const pIdEmpty = isEmpty(setProjectIdError, projectId)
    const sIdEmpty = isEmpty(setSampleIdError, sampleId)
    if(pIdEmpty || sIdEmpty){
      return false
    }
    return true
  }

  const handleAddAnother = (finish: boolean) => () => {
    if (!formValid()) {
      return;
    }
    clientLog('last end distance', experiments[experiments.length - 1]?.end_distance ?? 0)
    clientLog('calculatewidth of current', calculateExperimentWidth(numberOfMeasurements))
    clientLog('new end distance', (experiments[experiments.length - 1]?.end_distance ?? 0) + calculateExperimentWidth(numberOfMeasurements))
    const newExperiment: ExperimentIn = {
      project_id: projectId,
      sample_id: sampleId,
      comment,
      start_distance: experiments[experiments.length - 1]?.end_distance ?? 0,
      end_distance: (experiments[experiments.length - 1]?.end_distance ?? 0) + calculateExperimentWidth(numberOfMeasurements) + settings.experiment_gap / 2,
      measurement_times: actualTimes,
    }
    const newExperiments = [...experiments, newExperiment]
    setExperiments(newExperiments)
    setProjectId('')
    setSampleId('')
    setComment('')
    if (finish) {
      clientLog('creating new experiments ', newExperiments)
      createExperiments({body: newExperiments})
    }
  };


  function valueLabelFormat() {
    if (!settings)
      return
    return (
      <Box
        textAlign="center">{calculateExperimentWidth(numberOfMeasurements)} cm <br/> {numberOfMeasurements} Messungen</Box>);
  }

  const isEmpty = (stateFn: (error: string) => void, value: string): boolean => {
    if (!value || value.trim() === '') {
      stateFn("Bitte angeben.")
      return true
    }

    stateFn('')
    return false
  }

  const getTimesComponent = (mode: TimesMode) => {
    switch (mode) {
      case(TimesMode.EVERY_X): {
        return (
          <Box style={{display: 'inline-flex', alignItems: 'center'}}>
            <TextField
              type="number"
              value={everyX}
              InputProps={{
                endAdornment: <InputAdornment position="end">Minuten</InputAdornment>,
              }}
              onChange={(event) => setEveryX(event.target.value)}
            />
          </Box>
        )
      }
      case(TimesMode.DISTRIBUTED): {
        return (
          <Box style={{display: 'inline-flex', alignItems: 'center'}}>
            <TextField
              type="number"
              label="Verteilen auf"
              InputProps={{
                endAdornment: <InputAdornment position="end">Minuten</InputAdornment>,
              }}
              value={distributed}
              onChange={(event) => setDistributed(event.target.value)}/>
          </Box>
        )
      }
      case(TimesMode.MANUAL): {
        return Array.from(Array(numberOfMeasurements)).map((el, index) => <TextField
          key={`M${index + 1}`}
          margin="dense"
          required
          value={manualTimes[index]}
          error={errors['measurement_times'] !== undefined}
          helperText={errors['measurement_times']}
          disabled={index === 0}
          type="number"
          InputProps={{
            endAdornment: <InputAdornment position="end">Minuten</InputAdornment>,
            inputProps: {
              step: 0.01,
            },
          }}
          label={`Messung ${index + 1}`}
          onChange={(event) => {
            const newTimes = [...manualTimes]
            newTimes[index] = event.target.value
            setManualTimes(newTimes)
          }}
        />)
      }
    }
  }

  function sumOfWidths(exps: ExperimentIn[]) {
    return exps.reduce<number>((acc, cur) => {
      return acc + (cur.end_distance - cur.start_distance)
    }, 0)
  }

  function getMaxMeasurements(these_settings: SettingOut, these_experiments: ExperimentIn[]) {
    return Math.floor((these_settings.board_width - sumOfWidths(these_experiments)) / (these_settings.ball_diameter + these_settings.measurement_gap))
  }

  function calculateExperimentWidth(numberOfMeasurements: number) {
    return numberOfMeasurements * (settings.ball_diameter + settings.measurement_gap) - settings.measurement_gap
  }

  const calculateRemaining = (measurements: number) => {
    const currentWidth = calculateExperimentWidth(measurements) + sumOfWidths(experiments)
    const experimentGaps = experiments.length * settings.experiment_gap
    const remainingWidth = settings.board_width - currentWidth - experimentGaps
    return {
      distance: remainingWidth,
      measurements: Math.floor((remainingWidth) / (settings.ball_diameter + settings.measurement_gap)),
    }
  }


  const getContent = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4">Daten für Probe #{experiments.length + 1} eingeben</Typography>
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            fullWidth
            required
            error={projectIdError.trim() !== ''}
            helperText={projectIdError}
            type="text"
            label="Projekt-ID"
            InputProps={{
              inputProps: {
                maxLength: 200,
              },
            }}
            value={projectId}
            onBlur={(event) => {
              isEmpty(setProjectIdError, event.target.value)
            }}
            onChange={(event) => {
              isEmpty(setProjectIdError, event.target.value)
              setProjectId(event.target.value)
            }}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            fullWidth
            required
            error={sampleIdError.trim() !== ''}
            helperText={sampleIdError}
            type="text"
            label="Proben-ID"
            InputProps={{
              inputProps: {
                maxLength: 200,
              },
            }}
            value={sampleId}
            onBlur={(event) => {
              isEmpty(setSampleIdError, event.target.value)
            }}
            onChange={(event) => {
              isEmpty(setSampleIdError, event.target.value)
              setSampleId(event.target.value)
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            type="text"
            label="Kommentar"
            multiline
            rows="4"
            InputProps={{
              inputProps: {
                maxLength: 1000,
              },
            }}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
        </Grid>
        <Grid item xs={12} mt={2}>
          <Typography variant="subtitle1">Breite der Probe</Typography>
          {maximumNumberOfMeasurements === 1 ?
            <Typography>Verbleibende Breite reicht für eine Messung.</Typography> :
            <Slider
              value={numberOfMeasurements}
              onChange={(_, value) => setNumberOfMeasurements(value as number)}
              valueLabelDisplay="on"
              valueLabelFormat={valueLabelFormat}
              step={1}
              marks
              min={1}
              max={maximumNumberOfMeasurements}
            />
          }
          {maximumNumberOfMeasurements !== 1 && (<><Typography variant="subtitle2">Es sind
            noch {calculateRemaining(numberOfMeasurements)?.distance} cm
            übrig {'=>'} {calculateRemaining(numberOfMeasurements)?.measurements} weitere
            Messungen möglich</Typography></>)}
        </Grid>
        <Grid item xs={12} mt={2}>
          <Typography variant="subtitle1">Messzeitpunkte</Typography>
          <ToggleButtonGroup
            color="primary"
            value={timesMode}
            exclusive
            // @ts-ignore
            onChange={(event) => setTimesMode(event.target.value)}
          >
            <ToggleButton value={TimesMode.EVERY_X}>Alle X Minuten</ToggleButton>
            <ToggleButton value={TimesMode.DISTRIBUTED}>Gleichmäßig verteilt</ToggleButton>
            {/*<ToggleButton value={TimesMode.MANUAL}>Manuell</ToggleButton>*/}
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12}>
          {getTimesComponent(timesMode)}
        </Grid>
        <Grid item xs={12} mb={10}>
          <Typography variant="subtitle2">Die Messungen finden zu folgenden Zeitpunkten statt (in Minuten):</Typography>
          <Typography variant="subtitle2">{actualTimes.join(' | ')}</Typography>
        </Grid>
      </Grid>
    )
  }


  return (
    <Container>
      {getContent()}
      <div>
        <Button
          disabled={calculateRemaining(numberOfMeasurements).distance < settings.experiment_gap + settings.ball_diameter}
          onClick={handleAddAnother(false)}>
          Weitere Probe hinzufügen
        </Button>
        <LoadingButton
          // TODO finish this
          loading={createLoading}
          variant="contained"
          color="primary"
          onClick={handleFinish}
        >
          Setup abschließen
        </LoadingButton>
      </div>
    </Container>
  )
}


export default NewWizard;