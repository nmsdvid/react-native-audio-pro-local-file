import React, { useState } from 'react';
import { View, Button, Text } from 'react-native';
import RNFS, {
  DownloadProgressCallbackResult,
  DownloadBeginCallbackResult
} from 'react-native-fs';
import AudioPro from 'react-native-audio-pro';

type Item = {
  id: string;
  title: string;
  url: string;
  artist?: string;
  image?: string;
};

const ExampleAudioPlayer = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const sampleItem: Item = {
    id: '001',
    title: 'Sample Track',
    url: 'https://example.com/audio/sample.mp3',
    artist: 'Test Artist',
    image: 'https://example.com/image.jpg'
  };

  const trackEvent = (eventName: string, data: any) => {
    console.log(`Event: ${eventName}`, data);
  };

  const handleDownloaded = (id: string) => {
    console.log(`Download completed: ${id}`);
  };

  const handleDownload = async (item: Item) => {
    setIsDownloading(true);
    trackEvent('download_started', { id: item.id, title: item.title });

    const destinationPath = `${RNFS.DocumentDirectoryPath}/${item.id}.mp3`;

    const download = RNFS.downloadFile({
      fromUrl: item.url,
      toFile: destinationPath,
      progressInterval: 100,
      begin: (res: DownloadBeginCallbackResult) => {
        console.log('Download started', res);
      },
      progress: (res: DownloadProgressCallbackResult) => {
        const percent = (res.bytesWritten / res.contentLength) * 100;
        setDownloadProgress(percent);
      }
    });

    const result = await download.promise;

    if (result.statusCode === 200) {
      handleDownloaded(item.id);

      const track = {
        id: item.id,
        url: destinationPath,
        title: item.title,
        artist: item.artist || 'Unknown Artist',
        artwork: item.image || ''
      };

      console.log('Playing track:', track);
      AudioPro.play(track);
    } else {
      console.warn('Download failed with status code:', result.statusCode);
    }

    setIsDownloading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Download Progress: {downloadProgress.toFixed(2)}%</Text>
      <Button
        title={isDownloading ? 'Downloading...' : 'Download & Play'}
        onPress={() => handleDownload(sampleItem)}
        disabled={isDownloading}
      />
    </View>
  );
};

export default ExampleAudioPlayer;
