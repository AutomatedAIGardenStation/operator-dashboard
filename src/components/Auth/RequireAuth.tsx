import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface RequireAuthProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ component: Component, ...rest }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        return <Component {...props} />;
      }}
    />
  );
};
