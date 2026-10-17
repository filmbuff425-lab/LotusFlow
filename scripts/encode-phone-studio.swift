import Foundation
import AVFoundation
import AppKit
// Usage: swift encode-phone-studio.swift INPUT_DIRECTORY OUTPUT.mp4 [reverse]
let input=URL(fileURLWithPath:CommandLine.arguments[1]),output=URL(fileURLWithPath:CommandLine.arguments[2])
let reverse=CommandLine.arguments.count>3 && CommandLine.arguments[3]=="reverse"
let width=720,height=900,fps:Int32=30
let files=try FileManager.default.contentsOfDirectory(at:input,includingPropertiesForKeys:nil).filter{$0.lastPathComponent.hasPrefix("enter-") && $0.pathExtension=="jpg"}.sorted{$0.lastPathComponent < $1.lastPathComponent}
let frames=reverse ? files.reversed().map{$0} : files
let writer=try AVAssetWriter(outputURL:output,fileType:.mp4)
writer.shouldOptimizeForNetworkUse=true
let settings:[String:Any]=[AVVideoCodecKey:AVVideoCodecType.h264,AVVideoWidthKey:width,AVVideoHeightKey:height,AVVideoCompressionPropertiesKey:[AVVideoAverageBitRateKey:2600000,AVVideoExpectedSourceFrameRateKey:fps,AVVideoMaxKeyFrameIntervalKey:30,AVVideoProfileLevelKey:AVVideoProfileLevelH264HighAutoLevel]]
let track=AVAssetWriterInput(mediaType:.video,outputSettings:settings);track.expectsMediaDataInRealTime=false
let adaptor=AVAssetWriterInputPixelBufferAdaptor(assetWriterInput:track,sourcePixelBufferAttributes:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32ARGB,kCVPixelBufferWidthKey as String:width,kCVPixelBufferHeightKey as String:height,kCVPixelBufferCGImageCompatibilityKey as String:true,kCVPixelBufferCGBitmapContextCompatibilityKey as String:true])
writer.add(track);writer.startWriting();writer.startSession(atSourceTime:.zero)
for (i,file) in frames.enumerated(){
 while !track.isReadyForMoreMediaData {Thread.sleep(forTimeInterval:0.005)}
 try autoreleasepool{
  let bitmap=NSBitmapImageRep(data:try Data(contentsOf:file))!,image=bitmap.cgImage!
  var buffer:CVPixelBuffer?;CVPixelBufferPoolCreatePixelBuffer(nil,adaptor.pixelBufferPool!,&buffer)
  let pb=buffer!;CVPixelBufferLockBaseAddress(pb,[])
  let context=CGContext(data:CVPixelBufferGetBaseAddress(pb),width:width,height:height,bitsPerComponent:8,bytesPerRow:CVPixelBufferGetBytesPerRow(pb),space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipFirst.rawValue)!
  context.interpolationQuality = .high;context.draw(image,in:CGRect(x:0,y:0,width:width,height:height));CVPixelBufferUnlockBaseAddress(pb,[])
  if !adaptor.append(pb,withPresentationTime:CMTime(value:Int64(i),timescale:fps)){throw writer.error ?? NSError(domain:"Encoding",code:1)}
 }
}
track.markAsFinished();let done=DispatchSemaphore(value:0);writer.finishWriting{done.signal()};done.wait()
if writer.status != .completed {throw writer.error ?? NSError(domain:"Encoding",code:2)}
print("Encoded \(frames.count) frames at \(width)×\(height), \(fps) fps: \(output.path)")
