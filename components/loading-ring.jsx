const LoadingRing = ({ size, border }) => (
    <>
        <div className="ring"></div>
        <style jsx>{`
            .ring:after {
                content: " ";
                display: block;
                width: ${size};
                height: ${size};
                border: ${border} solid #000000;
                border-radius: 50%;
                border-color: #000000 transparent transparent transparent;
                animation: spin 1.2s linear infinite;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `}</style>
    </>
)

export default LoadingRing