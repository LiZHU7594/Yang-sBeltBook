import React, {useState} from 'react';
import axios from 'axios';
import {Dropdown} from "semantic-ui-react";
import {AddToBookModal} from "./AddToBookModal";
import {SearchResultPerPage} from "./SearchCategory";

export const Actions = {addToBook: 'AddToBook', deleteFromBook: 'DeleteFromBook', share: 'Share'}

export const SongListActionDropdown = (props) => {
    const {songSlug, bookId, action} = props;

    const [books, setBooks] = useState([]);

    // TODO: book pagination
    const [totalPages, setTotalPages] = useState(0);
    const [activePage, setActivePage] = useState(props.page ? props.page : 1);

    const handleDelete = () => {
        axios.patch(`/api/books/${bookId}/remove_song/`, {song: [{slug: songSlug}]}).then(response => {
            const {status, data} = response;
            if (status === 200) {
                window.location.reload();
            }
        })
    }

    const handleAddToBookClick = () => {
        axios.get(`/api/books/`).then(response => {
            const {status, data} = response;
            if (status.toString().startsWith('2')) {
                setBooks(data);
                setTotalPages(Math.ceil(data.count / SearchResultPerPage));
                setActivePage(1);
            }
        });
    }

    return (<Dropdown icon='ellipsis horizontal' className='song-list-action'>
        <Dropdown.Menu>
            {action.includes(Actions.deleteFromBook) ?
                <Dropdown.Item onClick={handleDelete}>Delete from this Book</Dropdown.Item> : null}
            {action.includes(Actions.addToBook) ?
                <AddToBookModal trigger={<Dropdown.Item onClick={handleAddToBookClick}>Add to Book</Dropdown.Item>}
                                songSlug={songSlug} books={books}/> : null}
            <Dropdown.Item>Share</Dropdown.Item>
        </Dropdown.Menu>
    </Dropdown>)
}