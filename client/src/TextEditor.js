import React, { useCallback, useEffect, useRef, useState } from 'react';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from 'react-router-dom';

function TextEditor() {

    const { id: documentId } = useParams();
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();
    const saveIntervalMS = 3000;
    const toolbarOptions = [

        [{ 'font': [] }, { 'size': [] }],
        // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],        
        [{ 'color': [] }, { 'background': [] }],    
        [{ 'script': 'super' }, { 'script': 'sub'}],    

        [{ 'header': 1 }, { 'header': 2 }, 'blockquote', 'code-block'],
        // [{ 'size': ['small', false, 'large', 'huge'] }], 
        
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],     
        [{'direction':'rtl'}, { 'align': [] }],
        ['link', 'image', 'video', 'formula'],

        ['clean']  // remove formatting button
      ];
    console.log(documentId);

    useEffect(() => {
        const s = io("http://localhost:3001");
        setSocket(s);

        return () => {
            s.disconnect();
        }
    }, [])

    useEffect(() => {
        if (socket == null || quill == null) {return}

        const interval = setInterval((delta, oldDelta, source) => {
            socket.emit('save-document', quill.getContents(delta));
        }, saveIntervalMS)
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) {return}

        socket.once('load-document', (document) => {
            quill.setContents(document);
            quill.enable();
        })

        socket.emit('get-document', documentId)
    }, [socket, quill, documentId])

    useEffect(() => {
        if (socket == null || quill == null) {return}

        const handler = (delta, oldDelta, source) => {
            quill.updateContents(delta)
        }
        socket.on('receive-changes', handler);

        return () => {
            socket.off('receive-changes', handler);
        }


    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) {return}

        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') {return}
            socket.emit('send-changes', delta);
        }
        quill.on('text-change', handler);

        return () => {
            quill.off('text-change', handler);
        }


    }, [socket, quill])

    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null)
        {
            return
        }

        wrapper.innerHTML = "";
        const editor = document.createElement('div');
        wrapper.append(editor);

        const options = {
            theme: 'snow',
            modules: {
                toolbar: toolbarOptions,
                
            },
            placeholder: '"Either write something worth reading or do something worth writing."'

        }
        const q = new Quill(editor, options);
        q.disable();
        q.setText('Document Loading...');
        setQuill(q);
    }, [])

    return (
        <div className="container" ref={wrapperRef}>
        </div>
    )
}

export default TextEditor
