import React, {useEffect, useState} from 'react';
import './App.css';
import tableStyle from './Table.module.css'
import inputStyle from './Input.module.css'
import { ControlFunctions } from 'use-debounce/lib/useDebouncedCallback';
import useDebounce from './use-debounce'
import fetch from "node-fetch";

function App() {

    // Состояние и сеттер состояния для поискового запроса
    const [searchTerm, setSearchTerm] = useState('');
    // Состояние и сеттер состояния для результатов поиска
    const [results, setResults] = useState([]);
    // Состояние для статуса поиска (есть ли ожидающий запрос API)
    const [isSearching, setIsSearching] = useState(false);
    // Состояние для статуса загрузки (пока не получили все данные)
    const [isLoading, setIsLoading] = useState(true);
    const [isSwitchData, setIsSwitchData] = useState(false);

    const api: string = 'https://swapi.dev/api/people'

    const debouncedSearchTerm = useDebounce(searchTerm, 1000);

    useEffect( () => {
            if (debouncedSearchTerm) {
                setIsSwitchData(true);
                setIsSearching(true);
                setDataToTable(api, debouncedSearchTerm).then(results => {
                    setIsSearching(false);
                    setResults(results);
                });
            } else {
                setIsLoading(true);
                setDataToTable(api).then(results => {
                    setIsLoading(false);
                    setResults(results);
                    setIsSwitchData(false);
                });
            }
        },
        [debouncedSearchTerm]
    );

    function searchData(url: string): Promise<any> {
        return fetch(url)
            .then(res => res.json())
            .then(res => {
                if(res.results.length)
                    return res.results;
                else
                    return [{name: 'There is', gender: 'no such', mass: 'person in', eye_color: 'galaxy'}];
            })
            .catch(error => alert(error.message));
    }

    let persons: any[] = [];
    function getData(url:string): Promise<any[] | unknown[] | void> {
        return fetch(url).then(res =>
            res.json()
        ).then(function(res) {
            if (res.next) {
                persons.push(res.results);
                return getData(res.next);
            } else {
                persons.push(res.results);
                return Promise.all(persons.map(person => person));
            }
        }).catch(error => alert(error.message));
    }

    function setDataToTable(api: string, search?: [string, ControlFunctions]) {
        if (search) {
            const url: string = api + `/?search=${search}`
            return searchData(url);
        } else {
            return getData(api);
        }

    }

    return (
        <div className="parent">
            <div className={inputStyle.myInput}>
                <input placeholder="Search by name"
                       onChange={e => setSearchTerm(e.target.value)}/>
            </div>
            {isSearching && <div>Searching ...</div>}
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
                    {!isSwitchData && results.map((result: any) => (
                        result.map((res: any) => (
                            <tr key={res.name}>
                                <td>{res.name}</td>
                                <td>{res.gender}</td>
                                <td>{res.mass}</td>
                                <td>{res.eye_color}</td>
                            </tr>
                        ))))}
                    {isSwitchData && results.map((res: any) => (
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
        </div>
    );
}
export default App;
