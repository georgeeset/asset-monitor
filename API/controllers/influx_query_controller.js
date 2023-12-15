/// perform query to influxdb


const bucket_data = (burket_name, ) => {
    queryClient = client.getQueryApi(org)
    fluxQuery = `from(bucket: ${burket_name})
    |> range(start: -10m)
    |> filter(fn: (r) => r._measurement == "measurement1")`;

    queryClient.queryRows(fluxQuery, {
    next: (row, tableMeta) => {
        const tableObject = tableMeta.toObject(row);
        console.log(tableObject);
    },
    error: (error) => {
        console.error('\nError', error);
    },
    complete: () => {
        console.log('\nSuccess');
    },
    })
}