import React from 'react';
import {Placeholder} from "semantic-ui-react";

export const SiteName = 'BeltBook'

export const ColumnColor = {
    voice_type: "red",
    gender: "orange",
    tessitura: "yellow",
    song_type: "green",
    era: "blue",
    character_type: "violet"
};

export const Notes = ["E2", "F2", "Gb2", "G2", "Ab2", "A2", "Bb2", "B2", "C3", "Db3", "D3", "Eb3",
    "E3", "F3", "Gb3", "G3", "Ab3", "A3", "Bb3", "B3", "C4", "Db4", "D4", "Eb4",
    "E4", "F4", "Gb4", "G4", "Ab4", "A4", "Bb4", "B4", "C5", "Db5", "D5", "Eb5",
    "E5", "F5", "Gb5", "G5", "Ab5", "A5", "Bb5", "B5", "C6", "Db6", "D6", "Eb6",
    "E6", "F6", "Gb6", "G6", "Ab6", "A6", "Bb6", "B6", "C7", "Db7", "D7", "Eb7",];

export function PlaceHolderBlock(props) {
    return (
        <Placeholder>
            {props.header ? <Placeholder.Header image>
                <Placeholder.Line/>
                <Placeholder.Line/>
            </Placeholder.Header> : null}
            {props.paragraph ? [...Array(props.repeat)].map((e, i) => <Placeholder.Paragraph key={i}>
                {props.lines ? [...Array(props.lines)].map((e, i) => <Placeholder.Line key={i}/>) : <Placeholder.Line/>}
            </Placeholder.Paragraph>) : null}
        </Placeholder>
    )
}
