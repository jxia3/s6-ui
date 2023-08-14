import { Monospace } from "../../fonts.js"
import LoadingRing from "../../../components/loading-ring.jsx"
import { useState } from "react"

// Method details input

const TextInput = ({
    label,
    value,
    setValue,
    error,
    setError,
    onChange,
    onBlur,
    monospace
}) => {
    const [ loading, setLoading ] = useState(false)

    return (
        <>
            <div className="content">
                <div className="label">
                    {label}
                    {loading ? <LoadingRing size="0.8rem" border="2px" /> : <></>}
                </div>
                <input
                    className={monospace ? `input mono ${Monospace.className}` : "input"}
                    type="text"
                    value={value}
                    onChange={event => {
                        // Run change handler and update value

                        if (onChange) {
                            onChange(event)
                        }
                        setValue(event.target.value)
                    }}
                    onFocus={setError ? () => setError(null) : null}
                    onBlur={async event => {
                        // Show loading indicator

                        if (onBlur) {
                            setLoading(true)
                            try {
                                await onBlur(event)
                            } catch {}
                            setLoading(false)
                        }
                    }}
                ></input>
                {error ? <div className={"error " + Monospace.className}>Error: {error}</div> : <></>}
            </div>
            <style jsx>{`
                .content {
                    margin-bottom: 20px;
                }

                .label {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 0.6rem;
                    font-size: 0.9rem;
                    margin-bottom: 4px;
                }

                .input {
                    width: 100%;
                    padding: 2px 5px;
                }

                .input {
                    ${error ? "border: 2px solid var(--error)" : ""};
                }

                .mono {
                    font-size: 0.8rem;
                }

                .error {
                    font-size: 0.8rem;
                    color: var(--error);
                    margin-top: 4px;
                }
            `}</style>
        </>
    )
}

export default TextInput