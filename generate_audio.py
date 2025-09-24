#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Audio Generator for Multi-language Dictionary
Generates MP3 files from Vietnamese text using gTTS (Google Text-to-Speech)
"""

import os
import sys
from pathlib import Path
from gtts import gTTS
import tempfile

def setup_tts_engine():
    """Setup TTS engine with Vietnamese voice"""
    try:
        print("Using Google Text-to-Speech (gTTS) for Vietnamese")
        print("Note: Requires internet connection")
        return "gtts"
        
    except Exception as e:
        print(f"Error setting up TTS engine: {e}")
        return None

def generate_audio_files():
    """Generate all audio files"""
    
    # Audio content
    audio_content = {
        'intro': 'Chào mừng đến với hướng dẫn sử dụng Từ Điển Đa Ngữ. Trang này sẽ hướng dẫn bạn cách sử dụng ứng dụng một cách hiệu quả nhất.',
        
        'basic-usage': 'Cách sử dụng cơ bản. Nhập từ cần tra cứu vào ô tìm kiếm và chọn ngôn ngữ nguồn và đích. Nhấn nút loa để nghe phát âm của từ vựng. Kiểm tra các từ đã tra cứu trước đó trong phần lịch sử.',
        
        'shortcuts': 'Phím tắt hữu ích. Phím D để chuyển đến trang từ điển. Phím H để về trang chủ. Phím G để mở hướng dẫn sử dụng. Phím P để phát hoặc tạm dừng audio. Phím cộng để tăng kích thước chữ. Phím trừ để giảm kích thước chữ. Phím 0 để đặt kích thước chữ về bình thường.',
        
        'features': 'Tính năng nổi bật. Hỗ trợ 8 ngôn ngữ bao gồm tiếng Việt, tiếng Anh, tiếng Nhật, tiếng Hàn, tiếng Trung, tiếng Pháp, tiếng Đức, tiếng Tây Ban Nha. Phát âm tự động bằng giọng nói tiếng Việt tự nhiên. Lưu trữ 20 từ tra cứu gần nhất. 6 cấp độ kích thước chữ từ nhỏ đến khổng lồ. Thân thiện với screen reader và có thể sử dụng hoàn toàn bằng bàn phím.',
        
        'tips': 'Mẹo sử dụng. Sử dụng phím tắt để điều hướng nhanh chóng và hiệu quả hơn. Luôn nghe phát âm để học cách đọc từ vựng chính xác. Tăng kích thước chữ nếu cần thiết để dễ đọc hơn. Kiểm tra lịch sử để ôn lại các từ đã học.',
        
        'home-intro': 'Chào mừng bạn đến với Từ Điển Đa Ngữ. Đây là ứng dụng được thiết kế đặc biệt cho người khiếm thị. Ứng dụng hỗ trợ tra cứu từ vựng giữa 8 ngôn ngữ phổ biến. Bao gồm: Tiếng Việt, tiếng Anh, tiếng Nhật, tiếng Hàn, tiếng Trung, tiếng Pháp, tiếng Đức, và tiếng Tây Ban Nha. Để sử dụng ứng dụng, bạn có thể: Trên Windows, nhấn Alt+D để chuyển đến trang tra từ điển. Trên macOS, nhấn Cmd+D. Nhấn Alt+P hoặc Cmd+P để phát hoặc tạm dừng audio giới thiệu này. Nhấn Alt+H hoặc Cmd+H để xem danh sách phím tắt đầy đủ. Nhấn Alt+G hoặc Cmd+G để mở hướng dẫn sử dụng. Nhấn Alt+C hoặc Cmd+C để mở trang liên hệ. Nhấn Alt+ cộng hoặc Cmd+ cộng để tăng kích thước chữ. Nhấn Alt+ trừ hoặc Cmd+ trừ để giảm kích thước chữ. Nhấn Alt+0 hoặc Cmd+0 để đặt lại kích thước chữ bình thường. Trong thanh audio, bạn có thể: Nhấn Space để phát hoặc tạm dừng. Nhấn mũi tên trái để lùi 10 giây. Nhấn mũi tên phải để tiến 10 giây. Ứng dụng được thiết kế với giao diện thân thiện. Hỗ trợ screen reader và có thể sử dụng hoàn toàn bằng bàn phím. Chúc bạn có trải nghiệm tốt với Từ Điển Đa Ngữ!',
        
        # Dictionary page audio content
        'dictionary-intro': 'Chào mừng bạn đến với tính năng tra từ điển đa ngữ. Đây là hướng dẫn chi tiết để sử dụng tính năng này một cách hiệu quả. Trang tra từ điển được thiết kế với giao diện từng bước để dễ sử dụng hơn cho người khiếm thị.',
        
        'dictionary-step1': 'Bước 1: Chọn ngôn ngữ nguồn. Đầu tiên, bạn cần chọn ngôn ngữ của từ bạn muốn tra. Nhấn phím số từ 1 đến 8 để chọn ngôn ngữ nguồn. Phím 1 là Tiếng Việt, phím 2 là English, phím 3 là 日本語, phím 4 là 한국어, phím 5 là 中文, phím 6 là Français, phím 7 là Deutsch, phím 8 là Español. Sau khi chọn, nhấn Enter để xác nhận.',
        
        'dictionary-step2': 'Bước 2: Chọn ngôn ngữ đích. Tiếp theo, chọn ngôn ngữ bạn muốn dịch sang. Sử dụng lại phím số từ 1 đến 8 để chọn ngôn ngữ đích. Phím 1 là Tiếng Việt, phím 2 là English, phím 3 là 日本語, phím 4 là 한국어, phím 5 là 中文, phím 6 là Français, phím 7 là Deutsch, phím 8 là Español. Nhấn Enter để xác nhận lựa chọn.',
        
        'dictionary-step3': 'Bước 3: Chọn cách nhập. Bây giờ bạn có thể chọn cách nhập từ cần tra. Nhấn phím 1 để chọn Nhập bằng bàn phím, hoặc nhấn phím 2 để chọn Nhập bằng giọng nói. Sau khi chọn, nhấn Enter để xác nhận.',
        
        'dictionary-step4': 'Bước 4: Nhập từ cần tra. Nếu bạn chọn nhập bằng bàn phím, hãy gõ từ cần tra vào ô tìm kiếm. Khi đang gõ trong ô tìm kiếm, tất cả phím tắt sẽ bị vô hiệu hóa, chỉ có phím Escape để thoát khỏi ô nhập liệu. Khi không gõ trong ô tìm kiếm, bạn có thể dùng phím Q, W, E, R để tìm kiếm nhanh các từ thông dụng. Nếu bạn chọn nhập bằng giọng nói, nhấn phím V để bắt đầu ghi âm, hoặc nhấn nút Bắt đầu nói. Sau khi ghi âm xong, nhấn phím V lần nữa để dừng ghi âm, hoặc nhấn Escape. Sau khi nhập xong, nhấn Enter hoặc nút Tìm kiếm để thực hiện tra cứu.',
        
        'dictionary-shortcuts': 'Phím tắt hữu ích cho tra từ điển. Nhấn phím mũi tên trái hoặc Backspace để quay lại bước trước. Nhấn phím H để về trang chủ. Nhấn phím Escape để ẩn kết quả hoặc dừng ghi âm. Nhấn phím V để bắt đầu hoặc dừng ghi âm giọng nói. Sử dụng phím cộng và trừ để điều chỉnh kích thước chữ. Nhấn phím 0 để đặt kích thước chữ về bình thường. Nhấn Space để phát hoặc tạm dừng audio hướng dẫn. Trong thanh audio, nhấn mũi tên trái để lùi 10 giây, mũi tên phải để tiến 10 giây.',
        
        # Language names for audio
        'lang-vietnamese': 'Tiếng Việt',
        'lang-english': 'Tiếng Anh',
        'lang-japanese': 'Tiếng Nhật',
        'lang-korean': 'Tiếng Hàn',
        'lang-chinese': 'Tiếng Trung',
        'lang-french': 'Tiếng Pháp',
        'lang-german': 'Tiếng Hà Lan',
        'lang-spanish': 'Tiếng Tây Ban Nha',
        
        # Input method names
        'input-keyboard': 'Nhập bằng bàn phím',
        'input-voice': 'Nhập bằng giọng nói'
    }
    
    # Setup TTS engine
    engine_type = setup_tts_engine()
    if not engine_type:
        print("Failed to setup TTS engine")
        return False
    
    # Create output directory
    output_dir = Path("frontend/assets/audio/mp3")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Generating audio files to: {output_dir}")
    print("=" * 50)
    
    success_count = 0
    total_count = len(audio_content)
    
    for filename, text in audio_content.items():
        try:
            print(f"Generating {filename}.mp3...")
            print(f"Text: {text[:50]}...")
            
            # Generate audio file using gTTS
            output_path = output_dir / f"{filename}.mp3"
            
            # Create gTTS object
            tts = gTTS(text=text, lang='vi', slow=False)
            
            # Save to temporary file first, then move to final location
            with tempfile.NamedTemporaryFile(delete=False, suffix='.mp3') as temp_file:
                tts.save(temp_file.name)
                temp_file.flush()
                
                # Move to final location
                import shutil
                shutil.move(temp_file.name, str(output_path))
            
            # Check if file was created
            if output_path.exists():
                file_size = output_path.stat().st_size
                print(f"✅ Success: {filename}.mp3 ({file_size} bytes)")
                success_count += 1
            else:
                print(f"❌ Failed: {filename}.mp3 not created")
            
            print("-" * 30)
            
        except Exception as e:
            print(f"❌ Error generating {filename}.mp3: {e}")
            print("-" * 30)
    
    print("=" * 50)
    print(f"Generation complete: {success_count}/{total_count} files created")
    
    if success_count == total_count:
        print("🎉 All audio files generated successfully!")
        return True
    else:
        print("⚠️  Some files failed to generate")
        return False

def install_requirements():
    """Install required packages"""
    try:
        import subprocess
        print("Installing required packages...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gtts", "pydub"])
        print("✅ Packages installed successfully!")
        return True
    except Exception as e:
        print(f"❌ Error installing packages: {e}")
        return False

def main():
    """Main function"""
    print("🎵 Audio Generator for Multi-language Dictionary")
    print("=" * 50)
    
    # Check if gtts is installed
    try:
        import gtts
        print("✅ gtts is already installed")
    except ImportError:
        print("❌ gtts not found. Installing...")
        if not install_requirements():
            print("Failed to install requirements. Please install manually:")
            print("pip install gtts pydub")
            return
    
    # Generate audio files
    success = generate_audio_files()
    
    if success:
        print("\n🎵 Audio generation completed successfully!")
        print("You can now use the audio files in your web application.")
    else:
        print("\n⚠️  Audio generation completed with some errors.")
        print("Please check the error messages above.")

if __name__ == "__main__":
    main()