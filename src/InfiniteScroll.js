import React, {
  useEffect,
  useReducer,
  useCallback,
  useState,
  useRef,
} from 'react';
import debounce from 'lodash.debounce';
import request from 'isomorphic-fetch';

const initialState = {
  data: [],
  loading: false,
  error: null,
};

const FETCH_START = 'FETCH_START';
const FETCH_DONE = 'FETCH_DONE';
const FETCH_ERROR = 'FETCH_ERROR';

function fetchStart() {
  return {
    type: FETCH_START,
  };
}

function fetchDone(data) {
  return {
    type: FETCH_DONE,
    payload: { data },
  };
}

function fetchError(error) {
  return {
    type: FETCH_ERROR,
    payload: { error },
  };
}

function fetchReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_START:
      return { ...state, loading: true, error: null };
    case FETCH_DONE:
      return {
        ...state,
        loading: false,
        data: [...state.data, ...action.payload.data],
      };
    case FETCH_ERROR:
      return { ...state, loading: false, error: action.payload.error };
    default:
      return state;
  }
}

function useUsers() {
  const [data, dispatch] = useReducer(fetchReducer, initialState);

  const fetchEvent = useCallback((page = 1) => {
    dispatch(fetchStart());

    request(`http://localhost:3000/employees?_page=${page}`)
      .then(response => response.json())
      .then(response => {
        dispatch(fetchDone(response));
      })
      .catch(error => {
        dispatch(fetchError(error.message));
      });
  }, []);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return { ...data, fetchEvent };
}

function Loading() {
  return <h1>Loading...</h1>;
}

function Error({ message }) {
  return <h1>Error:{message}</h1>;
}

function ListsUsers({ data = [] }) {
  return (
    <ul>
      {data.map(data => {
        return (
          <li key={data.id}>
            <p>Id: {data.id}</p>
            <p>First Name: {data.first_name}</p>
            <p>Last Name: {data.last_name}</p>
            <p>Email: {data.email}</p>
          </li>
        );
      })}
    </ul>
  );
}

function InfiniteScrollUsers() {
  const { data, loading, error, fetchEvent } = useUsers();
  const [loadMore, setLoadMore] = useState(false);
  const mainPageRef = useRef(null);

  let page = 1;

  const myDebounce = debounce(() => {
    // Bails early if:
    // * there's an error
    // * it's already loading
    // * there's nothing left to load
    if (error || loading || !mainPageRef) return;

    console.log('OffsetHeight:', mainPageRef.current.offsetHeight);
    console.log('Window innerHeight:', mainPageRef.current.clientHeight);
    console.log('ScrollTop:', mainPageRef.current.offsetTop - window.scrollY);
    console.log(
      window.innerHeight + document.documentElement.scrollTop ===
        document.documentElement.offsetHeight
    );

    // Checks that the page has scrolled to the bottom
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      console.log(page++);
      // setLoadMore(prevState => !prevState);
      // fetchEvent(++page);
    }
  }, 150);

  useEffect(() => {
    window.addEventListener('scroll', myDebounce);

    return () => {
      window.removeEventListener('scroll', myDebounce);
    };
  }, []);

  function renderComponent() {
    if (!loading && error) {
      return <Error message={error} />;
    }
    return <ListsUsers data={data} />;
  }

  return (
    <div ref={mainPageRef} className="main-page">
      {renderComponent()}
      {loadMore && <Loading />}
    </div>
  );
}

export default InfiniteScrollUsers;
