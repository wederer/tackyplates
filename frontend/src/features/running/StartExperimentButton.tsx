import {
  useTackyplatesUrlsStartExperimentMutation,
} from '../../app/experimentsApi'
import { LoadingButton } from "@mui/lab";
import { useEffect } from "react";
import { QueryStatus } from "@reduxjs/toolkit/query";

function StartExperimentButton(props: { experimentId: number, refetchCallback: Function } ) {
  const [startExperiment, {
    status,
    isLoading,
  }] = useTackyplatesUrlsStartExperimentMutation()

  useEffect(() => {
    if(status === QueryStatus.fulfilled){
      props.refetchCallback()
    }
  }, [status])

  return (<LoadingButton loading={isLoading} disabled={status !== QueryStatus.uninitialized} onClick={() => startExperiment({ experimentId: props.experimentId })} size="large">Experiment
    Starten</LoadingButton>)
}

export default StartExperimentButton
