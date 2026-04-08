import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by Error Boundary:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '40px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    borderRadius: '4px',
                    margin: '20px',
                    fontFamily: 'sans-serif'
                }}>
                    <h1>❌ Có lỗi xảy ra</h1>
                    <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                        Ứng dụng gặp phải lỗi. Vui lòng reload trang hoặc liên hệ quản trị viên.
                    </p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '15px', padding: '10px', backgroundColor: '#f5c6cb', borderRadius: '4px' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#721c24',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        Reload Trang
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
