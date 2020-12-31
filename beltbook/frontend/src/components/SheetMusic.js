import React, {useEffect, useRef} from 'react';
import Vex from 'vexflow';

const VF = Vex.Flow;

export const SheetMusic = (props) => {
    const outerRef = useRef(null);
    const svgContainer = document.createElement('div');
    const {notes, width, height} = props;

    const renderer = {elementId: svgContainer};
    if (width) {
        renderer.width = width;
    }
    if (height) {
        renderer.height = height;
    }

    const vf = new VF.Factory({
        renderer: renderer
    })

    useEffect(() => {
        const score = vf.EasyScore();
        const system = vf.System();
        system.addStave({
            voices: [
                score.voice(score.notes(notes, {align_center: true})),
            ]
        }).addClef('treble');
        vf.draw();
        outerRef.current.appendChild(svgContainer);
    }, [notes]);

    return (
        <div ref={outerRef}/>
    )
}