powershell

1. Get-NetAdapter

2. Get-NetAdapterAdvancedProperty
   2.1. 설정가능한 항목 과 설정값 조회.
   Get-NetAdapterAdvancedProperty -name '이더넷' | Select DisplayName, ValidDisplayValues

   - 설정값은 모두 조회되지 않음.

3. Set-NetAdapterAdvancedProperty (관리자 권한이 필요)

- Electron 앱을 관리자 권한으로 실행해야함
- Get-NetAdapterAdvancedProperty -name '이더넷' -DisplayName '속도 및 이중' -DisplayValue '100 Mbps 반이중'
