import mongoose from 'mongoose';


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Mongo db connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.log(error);
    }
};

const connectInflux = async () => {
    const token = process.env.INFLUXDB_TOKEN;
    const url = 'http://localhost:8086';

    try {
        const influx_client = new InfluxDB({url, token});
        console.log(`Influx db connected: ${influx_client}`);
        return influx_client;
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

// module.exports = {connectDB, connectInflux};
export default {connectDB, connectInflux};