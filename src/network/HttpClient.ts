import axios, { AxiosInstance } from 'axios'
import { TransportLayer } from './TransportLayer'
import { Task, Glossary, WorkerId, SessionStatus, GlossaryTerm, TermRequestBody } from 'src/models'
import {
    WorkerStatusJSON,
    SessionStatusJSON,
    TaskJSON,
    GlossaryJSON,
    toTask,
    toGlossary,
    toSessionStatus,
    toGlossaryTerm,
} from './responses'

interface HttpClientOptions {
    baseUrl: string
}

export class HttpClient implements TransportLayer {
    public workerId: string | null = null
    private options: HttpClientOptions
    private client: AxiosInstance

    constructor(options: HttpClientOptions) {
        this.options = options
        this.client = axios.create({
            baseURL: options.baseUrl,
        })
    }

    async authenticate(taskTypes: string[] = ['edit', 'review']): Promise<WorkerId> {
        const response = await this.client.post<WorkerStatusJSON>('/status', { task_types: taskTypes })
        const json = response.data
        return json.id
    }

    async getSessionStatus(workerId: string): Promise<SessionStatus> {
        const response = await this.client.get<SessionStatusJSON>('/status')
        const status = toSessionStatus(response.data, workerId)
        return status
    }

    async requestNewTask(workerId: WorkerId): Promise<Task> {
        const response = await this.client.post<TaskJSON>('/tasks/request', { worker_id: workerId })
        const task = toTask(response.data)
        return task
    }

    async publishTask(task: Task, data: any, workerId: WorkerId): Promise<void> {
        const body = {
            task_id: task.id,
            worker_id: workerId,
            segments: {
                body: {
                    start: task.text.editable.timing.start,
                    end: task.text.editable.timing.end,
                    words: task.text.editable.words.map((w) => ({
                        word: w.text,
                        start: w.timing.start,
                        end: w.timing.end,
                    })),
                },
            },
        }

        await this.client.post(`/tasks/submit`, body)
    }

    async getGlossary(): Promise<Glossary> {
        const response = await this.client.get<GlossaryJSON>('/gloss')
        return toGlossary(response.data)
    }

    async addGlossary(data: TermRequestBody): Promise<GlossaryTerm> {
        const response = await this.client.post('/gloss', { data })
        return toGlossaryTerm(data, response)
    }
}
