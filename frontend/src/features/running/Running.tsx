import { Card, CardActions, CardContent, CardHeader, Link, Stack, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import {
  ExpWithProgress,
  useTackyplatesUrlsGetProgressQuery,
} from '../../app/experimentsApi'
import LinearProgress from '@mui/material/LinearProgress'
import { Link as RouterLink } from 'react-router-dom'
import StartExperimentButton from "./StartExperimentButton";
import { clientLog } from '../../app/logging';

function Running() {
  const {
    data: progress,
    error: progressError,
    refetch,
  } = useTackyplatesUrlsGetProgressQuery(undefined, {pollingInterval: 5000, refetchOnMountOrArgChange: true })

  const showProgress = (experiment: ExpWithProgress) => {
    if (experiment.progress === null || experiment.progress === undefined) {
      return null
    }
    const resultsDisabled = experiment.progress !== 1
    return <>
      <CardActions sx={{justifyContent: 'end'}}>
        {
          resultsDisabled ?
            <Button size="large" disabled={true}>Ergebnisse anzeigen</Button>
            :
            <Link to={`/experiment/${experiment.id}`} component={RouterLink} underline="none">
              <Button size="large">Ergebnisse anzeigen</Button>
            </Link>
        }
      </CardActions>
      <LinearProgress variant="determinate" value={experiment.progress * 100}/>
    </>
  }

  if(progressError){
    clientLog(progressError)
    return <h2>Fehler bei der Verbindung.</h2>
  }

  if(!progress || progress.length === 0){
    return <h2>Keine Laufenden Experimente</h2>
  }

  return (<>
    <h2>Laufende Experimente</h2>
    <Stack spacing={2}>
      {progress.map((experiment, index) => (
        <Card key={index}>
          <CardHeader
            title={`${experiment.sample_id} | ${experiment.project_id}`}
            subheader={`Probe auftragen: ${experiment.start_distance}-${experiment.end_distance} cm | Messungen: ${experiment.measurement_times.length} | Geschätzte Dauer: ${experiment.measurement_times.at(-1) || 1} Minuten `}
          />
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              {experiment.comment}
            </Typography>
            <Typography variant="body2" color="text.secondary">
            </Typography>
          </CardContent>
          {
            experiment.started_on === null || experiment.started_on === undefined ?
              <CardActions sx={{justifyContent: 'end'}}>
                <StartExperimentButton experimentId={experiment.id} refetchCallback={refetch}></StartExperimentButton>
              </CardActions> :
              showProgress(experiment)
          }
        </Card>
      ))}
    </Stack>
  </>);
}

export default Running