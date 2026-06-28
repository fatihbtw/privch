export interface ViewsCount {
    user: {
        id: number,
        stream: {
            id: number,
            viewersCount: number,
            __typename: "Stream"
        },
        __typename: "User"
    },
    extensions: {
        durationMilliseconds: number,
        requestID: string,
        v: number
    }
}