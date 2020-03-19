import axios, { AxiosInstance } from 'axios'
import { TransportLayer } from './TransportLayer'
import { Task, Glossary } from 'src/models'
import { TaskJSON, GlossaryJSON, toTask, toGlossary } from './responses'

interface HttpClientOptions {
    baseUrl: string
}

export class HttpClient implements TransportLayer {
    private options: HttpClientOptions
    private client: AxiosInstance

    constructor(options: HttpClientOptions) {
        this.options = options
        this.client = axios.create({
            baseURL: options.baseUrl,
        })
    }

    async requestNewTask(): Promise<Task> {
        const response = await this.client.post<TaskJSON>('/tasks')
        const task = toTask(response.data)
        return task
    }

    async publishTask(task: Task): Promise<void> {
        throw new Error('Method not implemented.')
    }

    async getGlossary(): Promise<Glossary> {
        const response = await this.client.get<GlossaryJSON>('/glossary')
        const glossary = toGlossary(response.data)
        return glossary
    }
}
