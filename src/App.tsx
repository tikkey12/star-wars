import React, {useEffect, useState} from 'react';
import './App.css';
import tableStyle from './Table.module.css'
import inputStyle from './Input.module.css'
import tableNavigateStyle from './TableNavigate.module.css'
import useDebounce from './use-debounce'
import fetch from "node-fetch";

function App() {

    // Состояние и сеттер состояния для поискового запроса
    const [searchTerm, setSearchTerm] = useState('');
    // Состояние и сеттер состояния для результатов поиска
    const [results, setResults] = useState([]);
    // Состояние для статуса загрузки
    const [isLoading, setIsLoading] = useState(true);
    // Номер страницы поиска
    const [pageNum, setPageNum] = useState(1);
    // Номер последней страницы в api
    const [maxPageNum, setMaxPageNum] = useState(1);

    const api: string = 'https://swapi.dev/api/people/?'

    const debouncedSearchTerm = useDebounce(searchTerm, 1000);
    const debouncedSearchPage = useDebounce(pageNum, 1000);

    useEffect( () => {
            function setDataToTable(api: string, search?: string, page?: number) {
                if (search) {
                    return getData(api + `search=${search}`);
                } else {
                    return getData(api + `page=${page}`);
                }

            }
            setIsLoading(true);
            setDataToTable(api, debouncedSearchTerm, debouncedSearchPage).then(results => {
                setIsLoading(false);
                setResults(results);
            });
        },
        [debouncedSearchTerm, debouncedSearchPage]
    );

    function getData(url: string): Promise<any> {
        // const persons = {
        //     "count": 82,
        //     "results": [
        //         {
        //             name: "Luke Skywalker",
        //             mass: "77",
        //             gender: "male",
        //             eye_color: "blue",
        //         },
        //     ]};
        //
        // let myPromise = new Promise<any>((resolve, reject) => {
        //     resolve(persons);
        // });
        //
        // return myPromise.then(res => {setMaxPageNum(Math.ceil(Number(res.count)/10)); return res.results});
        return fetch(url)
            .then(res => res.json())
            .then(res => {
                setMaxPageNum(Math.ceil(Number(res.count)/10));
                if(res.results.length)
                    return res.results;
                else
                    return [{name: 'There is', gender: 'no such', mass: 'person in', eye_color: 'galaxy'}];
            })
            .catch(error => alert(error.message));
    }

    function checkInputPage(value: string) {
        if (Number(value) > maxPageNum)
            setPageNum(maxPageNum);
        else if (Number(value) < 1)
            setPageNum(1);
        else setPageNum(Number(value));
    }
    return (
        <div className="parent">
            <div className={inputStyle.myInput}>
                <input placeholder="Search by name"
                       onChange={e => setSearchTerm(e.target.value)}/>
            </div>
            {isLoading && <div>Loading ...</div>}
            <div className={tableStyle.myTable}>
                <table>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Mass</th>
                        <th>Eye color</th>
                    </tr>
                    </thead>
                    <tbody>
                    {results.map((res: any) => (
                        <tr key={res.name}>
                            <td>{res.name}</td>
                            <td>{res.gender}</td>
                            <td>{res.mass}</td>
                            <td>{res.eye_color}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className={tableNavigateStyle.myTableNavigate}>
                <button onClick={() => setPageNum(pageNum - 1)} disabled={pageNum === 1}>Previous</button>
                <button onClick={() => setPageNum(pageNum + 1)} disabled={pageNum === maxPageNum}>Next</button>
                <input placeholder="Search by name"
                       value={pageNum}
                       onChange={e => checkInputPage(e.target.value.replace(/\D/, ''))}/>
            </div>
        </div>
    );
}
export default App;
