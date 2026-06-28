export interface ChannelEmotes {
    data: {
        currentUser: null;
        channel: {
            id: string;
            localEmoteSets:
                | {
                      id: string;
                      emotes: [
                          {
                              id: string;
                              setID: string;
                              token: string;
                          }
                      ];
                  }[]
                | null;
        } | null;
        user: {
            subscriptionProducts: {
                id: string;
                emoteSetID: string;
                emoteGroups: {
                    id: string;
                }[];
                name: string;
                tier: string;
                emotes: {
                    id: string;
                    setID: string;
                    token: string;
                    assetType: string;
                }[];
            }[];
        } | null;
    };
}
