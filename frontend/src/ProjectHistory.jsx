import { useState } from "react";
import TaskInfo from "./TaskInfo";
import { hourMinSecondsMilli, formatDigit } from "../util";
import Button from "react-bootstrap/Button"
import { useEffect } from "react";
import { getTasks } from "../util/api";

function ProjectHistory({projectId, tab}) {
    const [tasks, setTasks] = useState([])
    const [task, setTask] = useState({})
    const [show, setShow] = useState(false)
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(10);
    
    const pullTasks = async(overhead, offset, limit, status) => {
        const pulledTasks = await getTasks(projectId, offset, limit, status)
        if(pulledTasks){
            setTasks([...overhead, ...pulledTasks]);
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        pullTasks([], offset, limit, "completed");
    }, [])

    useEffect(() => {
        if(tab === "history"){
            // eslint-disable-next-line react-hooks/set-state-in-effect
            pullTasks([], 0, limit + offset, "completed");
            setOffset(0);
            setLimit(10);
        }
    }, [tab])
    
    const loadTasks = () => {
        pullTasks(tasks, offset + limit, limit, "completed")
        setOffset(offset + limit);
    }

    const bucketTasksByDate = () => {
        let oldDate;
        const bucket = {}
        tasks.forEach(task => {
            const newDate = new Date(task.createdAt).toDateString();
            if(oldDate === undefined || oldDate !== newDate){
                oldDate = newDate;
                bucket[oldDate] = []
            }
            bucket[oldDate].push(task)
        })
        const sortedKeys = Object.keys(bucket)
        return { sortedKeys, bucket }
    }

    const createTaskListByDate = () => {
        const { sortedKeys, bucket } = bucketTasksByDate();
        return sortedKeys.map((key,index)  => {
            const tasks = bucket[key];
            return <div key={index}>
                <h1 className="start-date-header">{key}</h1>
                <hr/>
                {tasks.map((task) => {
                    const {hour, min, sec} = hourMinSecondsMilli(task.milliseconds)
                    return (
                        <div key={task.id} className='task-container'>
                            <div className="d-flex flex-row align-items-center mb-3 justify-content-between flex-wrap">                                
                                <div className="d-flex flex-row gap-2 align-items-center m-1">
                                    <Button variant="outline-dark" className="info-icon" onClick={() => showTaskModel(task)}>i</Button>
                                    <div>
                                        {task.name.substring(0, 50)}{task.detail.length > 50 ? '...': null}
                                    </div>
                                </div>
                                <div className="box-info m-1">
                                    <span>{formatDigit(hour)}</span>:<span>{formatDigit(min)}</span>:<span>{formatDigit(sec)}</span>
                                </div>
                            </div>
                            <hr />
                        </div>
                    )
                })}
            </div>
        })
    }

    const showTaskModel = (task) => {
        setShow(true)
        setTask(task)
    }


    return <>
        <TaskInfo task={task} show={show} setShow={setShow}/>
        <h1>Project History</h1>
        <div className="fixed-height">    
            <div className="mt-3 d-flex flex-column justify-content-start">
                 {createTaskListByDate()}
                <div className="align-self-center">
                    <button className="box-info" onClick={loadTasks}>
                        <span>Load more</span>
                    </button>
                </div> 
            </div>
        </div>
    </>
}

export default ProjectHistory;