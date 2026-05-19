import { Component } from 'react';
import { Button } from './ui/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-xl border border-priority-high/40 bg-background-card p-8 m-6">
          <h2 className="text-h3 text-priority-high mb-2">Something went wrong</h2>
          <p className="text-small text-text-secondary mb-4 font-mono break-all">
            {this.state.error.message}
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = '#/';
            }}
          >
            Go to Dashboard
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
