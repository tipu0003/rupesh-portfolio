import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import './SkillsFlow.css';
import AOS from 'aos';

function SkillsFlow() {
    useEffect(() => {
        AOS.init({ duration: 1000 });
    }, []);

    const elements = [
        { id: '1', type: 'input', data: { label: 'Skills' }, position: { x: 250, y: 0 } },
        { id: '2', data: { label: 'Structural Analysis' }, position: { x: 100, y: 100 } },
        { id: '3', data: { label: 'AutoCAD' }, position: { x: 400, y: 100 } },
        { id: '4', data: { label: 'Revit' }, position: { x: 100, y: 200 } },
        { id: '5', data: { label: 'MATLAB' }, position: { x: 400, y: 200 } },
        { id: '6', data: { label: 'Python' }, position: { x: 100, y: 300 } },
        { id: '7', data: { label: 'Concrete Design' }, position: { x: 400, y: 300 } },
        { id: '8', data: { label: 'Steel Design' }, position: { x: 250, y: 400 } },
        { id: '9', data: { label: '3dsMax' }, position: { x: 150, y: 500 } },
        { id: '10', data: { label: 'Engineering Codes' }, position: { x: 350, y: 500 } },
        { id: 'e1-2', source: '1', target: '2', animated: true },
        { id: 'e1-3', source: '1', target: '3', animated: true },
        { id: 'e2-4', source: '2', target: '4', animated: true },
        { id: 'e3-5', source: '3', target: '5', animated: true },
        { id: 'e4-6', source: '4', target: '6', animated: true },
        { id: 'e5-7', source: '5', target: '7', animated: true },
        { id: 'e7-8', source: '7', target: '8', animated: true },
        { id: 'e8-9', source: '8', target: '9', animated: true },
        { id: 'e8-10', source: '8', target: '10', animated: true },
    ];

    return (
        <section id="skills" className="skills-flow" data-aos="fade-up">
            <div className="container">
                <h2>Skills</h2>
                <div className="flow-container">
                    <ReactFlow elements={elements} style={{ width: '100%', height: 600 }}>
                        <Background color="#aaa" gap={16} />
                        <Controls />
                    </ReactFlow>
                </div>
            </div>
        </section>
    );
}

export default SkillsFlow;
