import React, { useState, useEffect } from "react";
import { AppState } from "./state/appStateReducer";
import { load } from "./api";

// props we are injecting in.
type InjectedProps = {
  initialState: AppState;
};

// represents the original props of the wrapped component
type PropsWithoutInjected<TBaseProps> = Omit<TBaseProps, keyof InjectedProps>;

// generic function that accepts a wrapped component and a TProps type variable
export function withInitialState<TProps>(
  //wrapped componet argument has a complex props type declaration we define it's props
  // as an intersection type betwenn the PropsWithOutnInjected<TProps> and the InjectedProps
  WrappedComponent: React.ComponentType<
    PropsWithoutInjected<TProps> & InjectedProps
  >
) {
  /*
        We end up with a type that is very similar to the TProps. We removed the injectedd props and
        then added them back. This might look tautological ,, but it is necessary to let Typescript know
        that the wrapped component will accept the InjectedProps. Typescript is very cautious with generic
        types and if we wouldn't perform this trick it wouldn't let us pass the fields defined in the InjectedProps
        type to out component.
     */
  return (props: PropsWithoutInjected<TProps>) => {
    const [initialState, setInitialState] = useState<AppState>({
      lists: [],
      draggedItem: null,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
      const fetchInitialState = async () => {
        try {
          const data = await load();
          setInitialState(data);
        } catch (e) {
          if (e instanceof Error) {
            setError(e);
          }
        }
        setIsLoading(false);
      };
      fetchInitialState();
    }, []);

    if (isLoading) {
      return <div>Loading</div>;
    }

    if (error) {
      return <div>{error.message}</div>;
    }

    return <WrappedComponent initialState={initialState} {...props} />;
  };
}
