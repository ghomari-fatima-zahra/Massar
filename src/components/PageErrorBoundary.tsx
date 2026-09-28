import { Component, type ErrorInfo, type ReactNode } from 'react';
import NotFoundPage from './NotFoundPage';

interface Props {
  children: ReactNode;
  resetKey: string;
  onReset: () => void;
}

interface State {
  hasError: boolean;
}

export default class PageErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erreur de rendu de page', error, info);
  }

  componentDidUpdate(previousProps: Props) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <NotFoundPage
          error
          eyebrow="Erreur inattendue"
          title="Impossible d’afficher cette page"
          description="Une erreur temporaire est survenue. Réessayez ou retournez au tableau de bord."
          actionLabel="Réessayer"
          onBack={() => {
            this.setState({ hasError: false });
            this.props.onReset();
          }}
        />
      );
    }

    return this.props.children;
  }
}
