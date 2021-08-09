import {act, render, screen, waitFor} from '@testing-library/react';
import App from './App';
import fetchMock from "fetch-mock";
import userEvent from "@testing-library/user-event";

const url = 'https://swapi.dev/api/people/?';

const person = {"results": [
  {
    name: "Luke Skywalker",
    mass: "77",
    gender: "male",
    eye_color: "blue",
  },
]};

describe("App test", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock.get(url + `page=1`, {
      status: 200,
      body: person,
    });
    fetchMock.get(url + `page=3`, {
      status: 200,
      body: person,
    });
    fetchMock.get(url + `search=Luke`, {
      status: 200,
      body: person,
    });
  })
  it("testing fetch", async () => {
    render(<App/>);
    const inputByName = screen.getByPlaceholderText('Search by name');
    const inputByPage = screen.getByPlaceholderText('Search by page');

    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual(url + `page=${inputByPage.value}`);
      expect(fetchMock.calls().length).toEqual(1);
    });

    await act(async () => {
      await userEvent.type(inputByPage, '3');
      jest.advanceTimersByTime(1000);
    })
    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual(url + `page=${inputByPage.value}`);
      expect(fetchMock.calls().length).toEqual(2);
    });

    await act(async () => {
      await userEvent.type(inputByName, 'Luke');
      jest.advanceTimersByTime(1000);
    })
    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual(url + `search=${inputByName.value}`);
      expect(fetchMock.calls().length).toEqual(3);
    });

    await act(async () => {
      await userEvent.type(inputByPage, '1');
      jest.advanceTimersByTime(1000);
    })
    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual(url + `search=${inputByName.value}`);
      expect(fetchMock.calls().length).toEqual(4);
    });
  })
})