import { Box, Container, Link, Tooltip } from '@mui/material'
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarFilterButton,
  useGridApiContext,
} from '@mui/x-data-grid'
import React, { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  useTackyplatesUrlsExcelExportMutation,
  useTackyplatesUrlsGetExperimentsQuery,
  useTackyplatesUrlsGetNewAllowedQuery,
} from '../../app/experimentsApi'
import { LoadingButton } from '@mui/lab';

function Experiments() {
  const columns: GridColDef[] = [
    {
      field: 'created_on',
      headerName: 'Erstellt am',
      width: 300,
      type: 'dateTime',
      valueGetter: ({value}) => value && new Date(value),
    },
    {field: 'project_id', headerName: 'Projekt-ID', width: 150},
    {field: 'sample_id', headerName: 'Proben-ID', width: 150},
  ];

  const {
    data: experiments,
    error: getExperimentsError,
    isLoading,
  } = useTackyplatesUrlsGetExperimentsQuery(undefined, {pollingInterval: 30000, refetchOnMountOrArgChange: true})

  const {
    data: newAllowed,
    error: allowedError,
    isLoading: allowedLoading
  } = useTackyplatesUrlsGetNewAllowedQuery(undefined, {pollingInterval: 5000, refetchOnMountOrArgChange: true})

  const [excelExport, exportResult] = useTackyplatesUrlsExcelExportMutation()

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

  let navigate = useNavigate();


  function CustomToolbar() {
    const apiRef = useGridApiContext();
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton/>
        <div>
          <LoadingButton loading={exportResult.isLoading} onClick={() => {
            excelExport({experimentIds: Array.from(apiRef.current.getVisibleRowModels(), ([key]) => key as string).join(',')})
          }
          }>
            <TableChartIcon/>
            <span style={{marginLeft: 4}}>XLSX exportieren</span>
          </LoadingButton>
        </div>
      </GridToolbarContainer>
    );
  }

  return (
    <Container>
      <Box mb={2} gap={2} display="flex" justifyContent="flex-end">
        <Link component={RouterLink} to="/running" underline="none" style={!!newAllowed ? {pointerEvents: 'none'} : {}}>
          <Tooltip title={newAllowed ? 'Keine laufenden Experimente' : ''}>
            <span>
              <LoadingButton loading={allowedLoading} disabled={!!newAllowed || !!allowedError}
                             variant={'outlined'}>Laufende Experimente</LoadingButton>
            </span>
          </Tooltip>
        </Link>
        <Link component={RouterLink} to="/new" underline="none" style={!newAllowed ? {pointerEvents: 'none'} : {}}>
          <Tooltip
            title={!newAllowed ? 'Um neue Experimente zu starten müssen alle laufenden Experimente abgeschlossen sein' : ''}>
            <span>
              <LoadingButton loading={allowedLoading} disabled={!newAllowed || !!allowedError} variant={'outlined'}>Neues Experiment durchführen</LoadingButton>
            </span>
          </Tooltip>
        </Link>
      </Box>
      <Box display="flex" style={{height: 700, width: '100%'}}>
        {/* TODO: server-side pagination https://mui.com/x/react-data-grid/pagination/#server-side-pagination + https://django-ninja.rest-framework.com/tutorial/pagination/ */}
        <DataGrid
          loading={isLoading}
          rows={experiments ?? []}
          error={getExperimentsError}
          onRowClick={(experiment) => navigate(`/experiment/${experiment.id}`)}
          columns={columns}
          components={{Toolbar: CustomToolbar}}
          initialState={{
            sorting: {
              sortModel: [{field: 'created_on', sort: 'desc'}],
            },
          }}
        />
      </Box>
    </Container>
  )
}

export default Experiments;
