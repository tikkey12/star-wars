import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import App from './App';
import fetchMock from "fetch-mock";

const url = 'https://swapi.dev/api/people';

const persons = {
  "next": null,
  "results": [
    {
      name: "Luke Skywalker",
      mass: "77",
      gender: "male",
      eye_color: "blue",
    },
  ]};

const person = {"results": [
  {
    name: "Luke Skywalker",
    mass: "77",
    gender: "male",
    eye_color: "blue",
  },
]};
// @ts-ignore
global.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve(persons),
    })
);
//configure({adapter: new Adapter()});
describe("App test", () => {
  beforeEach(() => {
    fetchMock.get(url, {
      status: 200,
      body: persons,
    });
    fetchMock.get(url + `/?search=Luke`, {
      status: 200,
      body: person,
    });
  })
  it("testing fetch", async () => {
    render(<App/>);
    const input = screen.getByRole('textbox');

    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual(url);
      expect(fetchMock.calls().length).toEqual(1);
      expect(fetchMock.done()).toEqual(true);
    });

    fireEvent.change(input, {
      target: {value: ''},
    });
    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual(url + `/?search=${input.value}`);
      expect(fetchMock.calls().length).toEqual(2);
      expect(fetchMock.done()).toEqual(true);
    });

    fireEvent.change(input, {
      target: {value: 'Luke'},
    });
    await waitFor(() => {
      expect(fetchMock.lastUrl()).toEqual(url + `/?search=${input.value}`);
      expect(fetchMock.calls().length).toEqual(3);
      expect(fetchMock.done()).toEqual(true);
    });
  })
})