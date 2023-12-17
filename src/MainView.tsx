import { useAtom } from 'jotai'
import { obsCamSceneAtom, obsIPAtom, obsIngameSceneAtom, obsPasswordAtom, obsPortAtom } from './Store'
import { useState } from 'react';
import { Box, Button, HStack, Input, InputGroup, InputLeftAddon, Select, Stack, Switch, useToast } from '@chakra-ui/react';
import OBSWebSocket, {EventSubscription, RequestBatchRequest} from 'obs-websocket-js';


const obs = new OBSWebSocket();

const SCENE_NAME = "Client + 1 Cam"

const MainView: React.FC = () => {

    const [obsIP, setOBSIP] = useAtom(obsIPAtom);
    const [obsPassword, setOBSPassword] = useAtom(obsPasswordAtom);
    const [obsPort, setOBSPort] = useAtom(obsPortAtom);
    const [obsIngameScene, setOBSIngameScene] = useAtom(obsIngameSceneAtom);
    const [obsCamScene, setOBSCamScene] = useAtom(obsCamSceneAtom);

    const [connectedToOBS, setConnectedToOBS] = useState(false);
    const [isIngameScene, setIsIngameScene] = useState(false);

    const [playerSourceIDs, setPlayerSourceIDs] = useState([0,0,0,0,0])
    const [sceneNames, setSceneNames] = useState(["-"]);

    const [swapDisabled, setSwapDisabled] = useState(false);



    const toast = useToast();

    function onConnect(){
        obs.connect(`ws://${obsIP}:${obsPort}`, obsPassword)
        .then((value) => {
            toast({
                title: 'Successfully connected.',
                status: 'success',
                duration: 1000,
                isClosable: true,
              })
              afterConnectRequests();
        })
        .catch((error) =>{
            toast({
                title: 'Connection failed.',
                description: error.message,
                status: 'error',
                duration: 1000,
                isClosable: true,
              })
        })
    }
    function afterConnectRequests(){
        onGetScenes();
        obs.call("SetStudioModeEnabled", {studioModeEnabled: true})
        setConnectedToOBS(true);
    }

    function onGetSceneItems(){
        obs.call("GetSceneItemList", {sceneName: obsIngameScene}).then((response) => {
            console.log("preprep", response.sceneItems)
            const playerSceneIDs: number[] = response.sceneItems.filter((scene: any) => scene.sourceName.includes("Valorant Spieler ")).map((scene: any) => scene.sceneItemId);
            setPlayerSourceIDs(playerSceneIDs);
            console.log("playerSceneIDs", playerSceneIDs)
        })
    }

    function onGetScenes(){
        obs.call("GetSceneList").then((response) => {
            const sceneNames: string[] = response.scenes.map((scene: any) => scene.sceneName);
            setSceneNames(sceneNames);
            console.log("sceneNames", sceneNames)
        })
    }

    function switchViewableScene(viewableSceneID: number){

        const playerArray = [0,1,2,3,4];
        const callArray: RequestBatchRequest[] = playerArray.map((number) => {
            return {
                requestType: 'SetSceneItemEnabled',
                requestData: {sceneName: obsIngameScene, sceneItemId: playerSourceIDs[number], sceneItemEnabled: viewableSceneID == number},
            }
        })
        callArray.push({requestType: "TriggerStudioModeTransition"})
        console.log(callArray)
        obs.callBatch(callArray).then();
    }


    async function onSwapIngame(){
        const callArray: RequestBatchRequest[] = [];
        setSwapDisabled(true);

       
        await obs.call("SetCurrentPreviewScene", {sceneName: obsIngameScene});
        //callArray.push({requestType: "SetCurrentSceneTransition", requestData: {transitionName: "CUE Übergang"}})
        callArray.push({requestType: "TriggerStudioModeTransition"})
        obs.callBatch(callArray).then((value) => {
            setTimeout(() => {
                //obs.call("SetCurrentSceneTransition", {transitionName: "Schnitt"});
                //obs.call("SetCurrentPreviewScene", {sceneName: obsIngameScene});
                obs.call("SetStudioModeEnabled", {studioModeEnabled: false})
                setIsIngameScene(true);
                setSwapDisabled(false);
            }, 4000)
        });
        onGetSceneItems();
    }

    async function onSwapCams(){
        const callArray: RequestBatchRequest[] = [];
        setSwapDisabled(true);
    
        await obs.call("SetStudioModeEnabled", {studioModeEnabled: true});
        
        setTimeout(async ()=> {
            await obs.call("SetCurrentPreviewScene", {sceneName: obsCamScene});
            callArray.push({requestType: "SetCurrentSceneTransition", requestData: {transitionName: "CUE Übergang"}})
            callArray.push({requestType: "TriggerStudioModeTransition"})
            obs.callBatch(callArray).then((value) => {
            setIsIngameScene(false)
            setTimeout(() => {
                setSwapDisabled(false);
            }, 4000)
        });
        }, 500)
        
    }
    

    function onTest(){
        obs.call("GetSceneTransitionList").then((response) => {
            console.log("GetSceneTransitionList", response)
        })
    }

    function setViewButtons(): React.ReactNode {
       
       if (!isIngameScene){
        return <></>
       }
       return (<>
            <Button mr={2} onClick={() => switchViewableScene(4)}>
                Flex
            </Button>
            <Button mr={2} onClick={() => switchViewableScene(3)}>
                Specter
            </Button>
            <Button mr={2} onClick={() => switchViewableScene(2)}>
                Jules
            </Button>
            <Button mr={2} onClick={() => switchViewableScene(1)}>
                Mufn
            </Button>
            <Button mr={2} onClick={() => switchViewableScene(0)}>
                Marian
            </Button>
        </>)
       
    }

    function getOptionElements(): React.ReactNode{
        return (<>
            <InputGroup size={"lg"}>
                <InputLeftAddon  pointerEvents='none'>
                    IP:
                </InputLeftAddon>
                <Input type="text" value={obsIP} onChange={(event) =>{setOBSIP(event.target.value)} } />
            </InputGroup>
            <InputGroup size={"lg"}>
                <InputLeftAddon  pointerEvents='none'>
                    Port:
                </InputLeftAddon>
                <Input  type="text" value={obsPort} onChange={(event) =>{setOBSPort(event.target.value)} } />
            </InputGroup>
            <InputGroup size={"lg"}>
                <InputLeftAddon  pointerEvents='none'>
                    Password:
                </InputLeftAddon>
                <Input type="text" value={obsPassword} onChange={(event) =>{setOBSPassword(event.target.value)} } />
            </InputGroup>
            <InputGroup size={"lg"}>
                <InputLeftAddon  pointerEvents='none'>
                    Ingame Scene:
                </InputLeftAddon>
                <Select value={obsIngameScene} onChange={(event) => setOBSIngameScene(event.target.value)}>
                    {sceneNames.map((name) => {
                        return <option value={name}>{name}</option>
                    })}
                </Select>
            </InputGroup>
            <InputGroup size={"lg"}>
                <InputLeftAddon  pointerEvents='none'>
                    Cam Scene:
                </InputLeftAddon>
                <Select value={obsCamScene} onChange={(event) => setOBSCamScene(event.target.value)}>
                    {sceneNames.map((name) => {
                        return <option value={name}>{name}</option>
                    })}
                </Select>
            </InputGroup>
        </>)
    }

    return (<>
        <Stack direction={['column', 'row']}>
            {getOptionElements()}
        </Stack>
        <Box mt="2">
            <Button mr="2" onClick={onConnect}>Connect</Button>
            <Button isDisabled={swapDisabled} display={connectedToOBS ? "" : 'none'} mr="2" onClick={onSwapIngame}>Swap to Ingame</Button>
            <Button isDisabled={swapDisabled} display={connectedToOBS ? "" : 'none'} mr="2" onClick={onSwapCams}>Swap to Cams</Button>
        </Box>
        <Box mt="2">
            {setViewButtons()}
        </Box>
        {/*<Button onClick={onTest}>TestButton</Button>*/}
        

    </>)
}

export default MainView;