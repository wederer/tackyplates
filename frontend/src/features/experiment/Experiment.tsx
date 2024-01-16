import { useParams } from 'react-router-dom'
import {
  ExperimentOut,
  useTackyplatesUrlsExcelExportMutation,
  useTackyplatesUrlsGetExperimentQuery
} from '../../app/experimentsApi'
import { CartesianGrid, Line, LineChart, Tooltip as RechartsTooltip, TooltipProps, XAxis } from 'recharts';
import format from 'date-fns/format';
import React, { useEffect, useState } from 'react'
import { addMilliseconds, addMinutes, parseISO } from 'date-fns'
import { Box, CircularProgress, Grid } from '@mui/material'
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { LoadingButton } from '@mui/lab';
import { clientLog } from '../../app/logging';

function Experiment() {
  let {experimentId} = useParams();
  const {
    data,
    error,
    isLoading,
  } = useTackyplatesUrlsGetExperimentQuery({experimentId: experimentId as any})

  const [excelExport, exportResult] = useTackyplatesUrlsExcelExportMutation()

  const [experiment, setExperiment] = useState<ExperimentOut>()

  useEffect(() => {
    if (!data) {
      return
    }

    const newExp: ExperimentOut = {
      ...data,
      measurements: data.measurements.map(measurement => {
        clientLog('created on', measurement.created_on)
        // @ts-ignore
        clientLog('relative', parseISO(measurement.created_on).getTime() - parseISO(data.started_on).getTime())
        return {
          ...measurement,
          // @ts-ignore // get duration in milliseconds
          created_on_relative: parseISO(measurement.created_on).getTime() - parseISO(data.started_on).getTime(),
        }
        // created_on_relative:  intervalToDuration({start: parseISO(measurement.created_on).getTime(), end: parseISO(data.sample_on).getTime()}),
      }).sort((a, b) => a.created_on_relative - b.created_on_relative),
    }

    setExperiment(newExp)
  }, [data])


  const formatDate = (duration: number|string) => {
    if (typeof duration === 'number') {
      const helperDate = addMilliseconds(parseISO('1970-01-01T00:00:00Z'), duration);
      return format(addMinutes(helperDate, helperDate.getTimezoneOffset()), 'HH:mm:ss')
    }
    return duration
  }
  const CustomTooltip = ({
                           active,
                           payload,
                           label,
                         }: TooltipProps<ValueType, NameType>) => {
    if (active) {
      const formatted = formatDate(label)
      const roundedValue = Math.round(payload?.[0].value as number *100) / 100
      return (
        <div className="custom-tooltip">
          <p className="label">{formatted}</p>
          <p className="desc">{`${roundedValue} cm`}</p>
        </div>
      );
    }

    return null;
  };

  useEffect(() => {
    if (exportResult.isSuccess) {
      fetch(`/${exportResult.data}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      })
        .then((response) => response.blob())
        .then((blob) => {
          // Create blob link to download
          const url = window.URL.createObjectURL(
            new Blob([blob]),
          );
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute(
            'download',
            `${exportResult.data.split('/')[1]}`,
          );

          // Append to html link element page
          document.body.appendChild(link);

          // Start download
          link.click();

          // Clean up and remove the link
          // @ts-ignore
          link.parentNode.removeChild(link);
        });
    }
  }, [exportResult])


  if(error){
    // @ts-ignore
    if(typeof error.status !== 'undefined' && error.status === 404){
      return <div>Experiment not found.</div>
    }
    return <div>Error trying to load experiment</div>
  }

  if (!experimentId) {
    return <div>Experiment not found.</div>
  }


  const exportElement = (experimentId: string | undefined) => {
    if (experimentId === undefined) {
      return <div>Error</div>
    }

    if (exportResult.error) {
      return <span>Fehler beim Exportieren. Falls der Fehler nach Refresh immer noch besteht bitte den Administrator kontaktieren.</span>
    }

    return <LoadingButton
      loading={exportResult.isLoading}
      onClick={() => excelExport({experimentIds: experimentId})}>Als XLSX exportieren</LoadingButton>
  }

  const renderChart = () => {
    if (!experiment){
      return <Box>Experiment wurde nicht gefunden</Box>
    }

    if (!experiment.started_on){
      return <Box>Experiment wurde nie ausgeführt</Box>
    }

    if (!experiment.measurements || experiment.measurements.length === 0){
      return <Box>Es liegen keine Messungen vor.</Box>
    }
    return (
    <LineChart width={1000} height={600} data={experiment.measurements} onClick={(sth) => console.log(sth)}
               id="test">
      <Line type="monotone" dataKey="value" stroke="#8884d8"/>
      <CartesianGrid stroke="#ccc"/>
      <XAxis dataKey="created_on_relative" tickFormatter={(duration, _) => formatDate(duration)}/>
      <RechartsTooltip content={<CustomTooltip/>}/>
    </LineChart>
    )
  }

  if(isLoading){
    return <Box><span>Experiment wird geladen...</span><CircularProgress/></Box>
  }

  return (
    <Grid container>
      {
        experiment && <>
          <Grid item xs={12}>
            Projekt-ID: {experiment.project_id}<br/>
            Proben-ID: {experiment.sample_id}<br/>
            {experiment.comment && <>Kommentar: {experiment.comment}<br/></>}
          </Grid>
          <Grid item xs={12} mt={2}>
            {renderChart()}
          </Grid>
          <Grid item xs={6}>
            {exportElement(experimentId)}
            {/*<Tooltip title="Funktion noch nicht implementiert.">*/}
            {/*  <span><Button disabled={true}>Export zum LIMS</Button></span>*/}
            {/*</Tooltip>*/}
          </Grid>
        </>
      }
    </Grid>
  )
}

export default Experiment;
