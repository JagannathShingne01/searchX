import dotenv from "dotenv";
import { rabbitMQ } from "../config/rabbitmq";
import { elasticsearchWorker } from "./elasticsearch.worker";



dotenv.config();
async function start() {

    await rabbitMQ.connect();

    await elasticsearchWorker.start();

}

start();