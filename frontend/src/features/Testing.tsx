import Button from '@mui/material/Button'
import {
  useTackyplatesUrlsDropBallMutation,
  useTackyplatesUrlsMeasureMutation,
  useTackyplatesUrlsGotoMutation,
  useTackyplatesUrlsMoveBallguideMutation,
  useTackyplatesUrlsHeartbeatQuery, useTackyplatesUrlsGetNewAllowedQuery,
} from '../app/experimentsApi'
import { useEffect, useState } from 'react'
import { CircularProgress, TextField, Typography } from '@mui/material'
import { clientLog } from '../app/logging';

function Testing() {
  const [dropBall, ballResult] = useTackyplatesUrlsDropBallMutation()
  const [measure, measureResult] = useTackyplatesUrlsMeasureMutation()
  const [moveStepper] = useTackyplatesUrlsGotoMutation()
  const [moveBallGuide] = useTackyplatesUrlsMoveBallguideMutation()

  const {data: serverTime, error: heartbeatError, isLoading: heartbeatLoading} = useTackyplatesUrlsHeartbeatQuery(undefined, {pollingInterval: 5000, refetchOnMountOrArgChange: true})

  const [position, setPosition] = useState(0)
  useEffect(() => {
    if (measureResult.status === 'fulfilled') {
      clientLog('measured:', measureResult.data)
    }
  }, [measureResult])

  useEffect(() => {
    if (ballResult.status === 'fulfilled') {
      clientLog('dropped ball', ballResult)
    }
  }, [ballResult])

  if (heartbeatLoading) {
    return <><h3>Connecting to Backend</h3><CircularProgress/></>
  }

  if (heartbeatError) {
    return <><h3>Connection to Backend unsuccessful</h3><p>Backend running and Frontend built with correct backend IP? Maybe run ./build.sh again.</p></>
  }

  return (
    <>
      <Typography mb={4}>DateTime auf dem RPI: {serverTime}</Typography>
      <TextField
        type="number"
        InputProps={{
          inputProps: {
            min: 0,
          },
        }}
        value={position}
        // @ts-ignore
        onChange={(event) => setPosition(event.target.value)}
      />
      <Button
        onClick={() => moveStepper({position})}
        variant="contained"
        sx={{m: 2}}
      >
        Move stepper
      </Button>
      <br/>
      <br/>
      <br/>
      <Button
        onClick={() => measure()}
        variant="contained"
        sx={{m: 2}}
        disabled={measureResult.isLoading}
      >
        Take distance sensor measurement
      </Button>
      measured:
      {measureResult.status === 'fulfilled' ? measureResult.data : ''}
      {measureResult.isLoading && <CircularProgress/>}
      <br/>
      <br/>
      <Button
        onClick={() => dropBall()}
        variant="contained"
        sx={{m: 2}}
      >
        Drop Ball
      </Button>
      <br/>
      <br/>
      <Button
        onClick={() => moveBallGuide({position: 1})}
        variant="contained"
        sx={{m: 2}}
      >
        Guide Up
      </Button>
      <Button
        onClick={() => moveBallGuide({position: 0})}
        variant="contained"
        sx={{m: 2}}
      >
        Guide down
      </Button>
    </>
  )
}

export default Testing
