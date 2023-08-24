// import { useState } from 'react';
// import { usePopper } from 'react-popper';

// export default function Popover() {
//     const [referenceElement, setReferenceElement] = useState<HTMLButtonElement | null>(null);
//     const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
//     const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
//     const { styles, attributes } = usePopper(referenceElement, popperElement, {
//         modifiers: [{ name: 'arrow', options: { element: arrowElement } }],
//     });

//     return (
//         <>
//             <button type="button" ref={setReferenceElement}>
//                 Reference element
//             </button>

//             <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
//                 Popper element
//                 <div ref={setArrowElement} style={styles.arrow} />
//             </div>
//         </>
//     );
// };
